import { identifierPayload, type IdentifierKind } from './identifier'
import type { Transport } from '../core/transport'
import type { TokenManager } from '../core/tokenManager'
import type { EventEmitter } from '../core/eventEmitter'
import type { SaaSEvents } from '../core/client'
import type {
  User, ProjectSettings, AuthResult, SignInResult, SignUpResult, SignUpOptions,
  OAuthProvider, Org, Member, Invite, PendingInvite, MyPendingInvite, MfaSetupResult, MfaVerifyResult,
  AuthStateCallback, Role, InviteLink, InviteLinkInfo, UseInviteLinkResult,
  InviteInfo, AcceptInviteByCodeResult, ApiKey, CreatedApiKey, CreateApiKeyInput,
  PhoneOtpPurpose, PhoneOtpSendResult, PhoneOtpVerifyResult,
  FaceSample, FaceStatus, FaceEnrollResult,
} from './types'

const OAUTH_POPUP_WIDTH = 500
const OAUTH_POPUP_HEIGHT = 600
const OAUTH_TIMEOUT_MS = 5 * 60 * 1000

export class AuthClient {
  private transport: Transport
  private tokenManager: TokenManager | null
  private emitter: EventEmitter<SaaSEvents>
  private baseUrl: string
  private cachedUser: User | null = null
  private cachedSettings: ProjectSettings | null = null
  private loaded = false
  private loadPromise: Promise<void> | null = null

  constructor(
    transport: Transport,
    tokenManager: TokenManager | null,
    emitter: EventEmitter<SaaSEvents>,
    baseUrl: string,
  ) {
    this.transport = transport
    this.tokenManager = tokenManager
    this.emitter = emitter
    this.baseUrl = baseUrl
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  async load(): Promise<void> {
    if (this.loaded) return
    if (this.loadPromise) return this.loadPromise
    this.loadPromise = this.doLoad().finally(() => { this.loadPromise = null })
    return this.loadPromise
  }

  private async doLoad(): Promise<void> {
    try {
      this.cachedSettings = await this.transport.get<ProjectSettings>('/auth/settings')
    } catch (e) {
      console.warn('[SaaS Support] Failed to load project settings:', e)
    }

    if (this.tokenManager?.hasRefreshToken()) {
      try {
        await this.tokenManager.refreshOnce()
      } catch {
        this.tokenManager?.clearTokens()
      }
    }

    this.loaded = true
  }

  // ---------------------------------------------------------------------------
  // Core auth operations
  // ---------------------------------------------------------------------------

  /**
   * Signs in with an e-mail address or a phone number, depending on what the
   * project accepts. Pass `kind` when the form already knows which one the user
   * entered; otherwise the identifier is classified by shape.
   */
  async signIn(identifier: string, password: string, kind?: IdentifierKind): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/login', {
      ...identifierPayload(identifier, kind),
      password,
    })
    return this.completeAuthStep(result)
  }

  /**
   * Stores the session unless the response is a second-factor challenge, in
   * which case it is handed back untouched for the caller to resolve.
   */
  private completeAuthStep(result: AuthResult): AuthResult {
    if ('mfaRequired' in result && result.mfaRequired) return result
    if ('faceRequired' in result && result.faceRequired) return result

    const signIn = result as SignInResult
    this.setSession(signIn)
    return signIn
  }

  /**
   * Registers with an e-mail address or a phone number.
   *
   * `inviteCode` attaches the new user to the inviting organization instead of
   * creating one, and works even when self-service registration is switched off.
   * `otpToken` proves ownership of a phone number and is only needed when
   * `settings.phoneOtpRequired` is true.
   *
   * The third argument also accepts a bare invite code for backwards
   * compatibility with releases before phone sign-up.
   */
  async signUp(
    identifier: string,
    password: string,
    optionsOrInviteCode?: SignUpOptions | string,
    kind?: IdentifierKind,
  ): Promise<SignUpResult> {
    const options: SignUpOptions =
      typeof optionsOrInviteCode === 'string'
        ? { inviteCode: optionsOrInviteCode, kind }
        : { kind, ...optionsOrInviteCode }

    const body: Record<string, string> = {
      ...identifierPayload(identifier, options.kind),
      password,
    }
    if (options.inviteCode) body.inviteCode = options.inviteCode
    if (options.otpToken) body.otpToken = options.otpToken

    const result = await this.transport.post<SignUpResult>('/auth/register', body)
    this.setSession(result)
    return result
  }

  // ---------------------------------------------------------------------------
  // Phone verification (SMS one-time codes)
  // ---------------------------------------------------------------------------

  /**
   * Sends a one-time code to a phone number. Rejects with a 409 when the
   * project has no SMS provider configured — callers should treat that as
   * "verification unavailable", not as a failure to sign up.
   */
  async sendPhoneOtp(phone: string, purpose: PhoneOtpPurpose = 'register'): Promise<PhoneOtpSendResult> {
    return this.transport.post<PhoneOtpSendResult>('/auth/phone/otp/send', { phone, purpose })
  }

  /** Exchanges a delivered code for a short-lived proof-of-ownership token. */
  async verifyPhoneOtp(
    phone: string,
    code: string,
    purpose: PhoneOtpPurpose = 'register',
  ): Promise<PhoneOtpVerifyResult> {
    return this.transport.post<PhoneOtpVerifyResult>('/auth/phone/otp/verify', { phone, code, purpose })
  }

  /** Sets a new password for a phone account, authorized by a "reset" OTP token. */
  async resetPasswordByPhone(phone: string, otpToken: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/password-reset/phone', { phone, otpToken, newPassword })
  }

  async signOut(): Promise<void> {
    const refreshToken = this.tokenManager?.getRefreshToken()
    if (refreshToken) {
      try {
        await this.transport.post('/auth/logout', { refreshToken })
      } catch {
        // Best-effort logout.
      }
    }
    this.clearSession()
  }

  /**
   * Opens the provider's consent popup and exchanges the returned code for a
   * session. Pass `inviteCode` when the user arrived from an invite landing
   * page: it keeps an OAuth sign-up on the invite path, so the backend attaches
   * the invited membership instead of creating a personal organization.
   */
  async signInWithOAuth(provider: OAuthProvider, inviteCode?: string): Promise<AuthResult> {
    const popupCallbackUrl = `${this.baseUrl}/auth/oauth/${provider}/popup-callback`

    const { authUrl, state } = await this.transport.get<{ authUrl: string; state: string }>(
      `/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(popupCallbackUrl)}`,
    )

    const left = window.screenX + (window.innerWidth - OAUTH_POPUP_WIDTH) / 2
    const top = window.screenY + (window.innerHeight - OAUTH_POPUP_HEIGHT) / 2
    const popup = window.open(
      authUrl,
      'saas-support-oauth',
      `width=${OAUTH_POPUP_WIDTH},height=${OAUTH_POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`,
    )

    return new Promise<AuthResult>((resolve, reject) => {
      let settled = false

      const handler = async (event: MessageEvent) => {
        if (event.data?.type !== 'saas-support:oauth-callback') return
        if (settled) return
        settled = true
        window.removeEventListener('message', handler)
        clearTimeout(timeout)
        clearInterval(pollClosed)
        popup?.close()

        if (event.data.error) {
          reject(new Error(`OAuth error: ${event.data.error}`))
          return
        }

        try {
          const result = await this.transport.post<AuthResult>(
            `/auth/oauth/${provider}/callback`,
            { code: event.data.code, state: event.data.state || state, inviteCode },
          )
          // A project with face control answers with a challenge rather than a
          // session, so the result goes through the same gate as password login.
          resolve(this.completeAuthStep(result))
        } catch (err) {
          reject(err)
        }
      }

      window.addEventListener('message', handler)

      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        window.removeEventListener('message', handler)
        clearInterval(pollClosed)
        popup?.close()
        reject(new Error('OAuth popup timed out'))
      }, OAUTH_TIMEOUT_MS)

      const pollClosed = setInterval(() => {
        if (popup?.closed && !settled) {
          settled = true
          clearInterval(pollClosed)
          clearTimeout(timeout)
          window.removeEventListener('message', handler)
          reject(new Error('OAuth popup was closed'))
        }
      }, 500)
    })
  }

  /**
   * Completes the TOTP step. When the project also uses face control the result
   * is a face challenge rather than a session — check with `isFaceRequired`.
   */
  async submitMfaCode(mfaToken: string, code: string): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/login/mfa', { mfaToken, code })
    return this.completeAuthStep(result)
  }

  // ---------------------------------------------------------------------------
  // Face control
  // ---------------------------------------------------------------------------

  /**
   * Stores the user's face template.
   *
   * Pass `faceToken` from a `faceRequired` login response to enroll during
   * sign-in — that also completes the sign-in and starts the session. Without a
   * token the call enrolls (or re-scans) the already signed-in user.
   *
   * `consent` is mandatory: face data is only stored on an explicit opt-in.
   */
  async enrollFace(
    samples: FaceSample[],
    options: { faceToken?: string; model?: string } = {},
  ): Promise<FaceEnrollResult> {
    const result = await this.transport.post<FaceEnrollResult>(
      '/auth/face/enroll',
      {
        samples,
        consent: true,
        model: options.model ?? 'face-api/128',
        faceToken: options.faceToken,
      },
      options.faceToken ? undefined : this.authHeaders(),
    )

    if (result.accessToken && result.refreshToken && result.user) {
      this.setSession(result as unknown as SignInResult)
    }
    return result
  }

  /** Finishes a sign-in by matching a live face against the stored template. */
  async verifyFace(faceToken: string, descriptor: number[]): Promise<SignInResult> {
    const result = await this.transport.post<SignInResult>('/auth/face/verify', {
      faceToken,
      descriptor,
    })
    this.setSession(result)
    return result
  }

  async getFaceStatus(): Promise<FaceStatus> {
    return this.transport.get<FaceStatus>('/auth/face/status', this.authHeaders())
  }

  /** Removes the user's face template so they can scan again. */
  async deleteFace(): Promise<void> {
    await this.transport.del('/auth/face', this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Magic link & password reset
  // ---------------------------------------------------------------------------

  async sendMagicLink(email: string, redirectUrl: string): Promise<void> {
    await this.transport.post('/auth/magic-link/send', { email, redirectUrl })
  }

  /**
   * Redeems a magic link. Like password sign-in, this can come back as a face
   * challenge instead of a session — check with `isFaceRequired`.
   */
  async verifyMagicLink(token: string): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/magic-link/verify', { token })
    return this.completeAuthStep(result)
  }

  async sendPasswordReset(email: string, redirectUrl: string): Promise<void> {
    await this.transport.post('/auth/password-reset/send', { email, redirectUrl })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/password-reset/verify', { token, newPassword })
  }

  // ---------------------------------------------------------------------------
  // MFA management
  // ---------------------------------------------------------------------------

  async setupMfa(): Promise<MfaSetupResult> {
    return this.transport.post<MfaSetupResult>('/auth/mfa/setup', undefined, this.authHeaders())
  }

  async verifyMfa(code: string): Promise<MfaVerifyResult> {
    return this.transport.post<MfaVerifyResult>('/auth/mfa/verify', { code }, this.authHeaders())
  }

  async disableMfa(code: string): Promise<void> {
    await this.transport.post('/auth/mfa/disable', { code }, this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Token & user access
  // ---------------------------------------------------------------------------

  async getToken(): Promise<string | null> {
    const token = this.tokenManager?.getAccessToken() ?? null
    if (token) return token

    if (this.tokenManager?.hasRefreshToken()) {
      try {
        await this.tokenManager.refreshOnce()
        return this.tokenManager?.getAccessToken() ?? null
      } catch {
        this.clearSession()
        return null
      }
    }
    return null
  }

  async getUser(): Promise<User | null> {
    if (this.cachedUser) return this.cachedUser

    const token = await this.getToken()
    if (!token) return null

    try {
      this.cachedUser = await this.transport.get<User>('/auth/me', { 'Authorization': `Bearer ${token}` })
      return this.cachedUser
    } catch {
      return null
    }
  }

  async refreshUser(): Promise<User | null> {
    const token = await this.getToken()
    if (!token) return this.cachedUser

    try {
      this.cachedUser = await this.transport.get<User>('/auth/me', { 'Authorization': `Bearer ${token}` })
      this.emitter.emit('authStateChange', this.cachedUser)
      return this.cachedUser
    } catch {
      return this.cachedUser
    }
  }

  getUserSync(): User | null {
    return this.cachedUser
  }

  isLoaded(): boolean {
    return this.loaded
  }

  async getSettings(): Promise<ProjectSettings | null> {
    if (this.cachedSettings) return this.cachedSettings
    try {
      this.cachedSettings = await this.transport.get<ProjectSettings>('/auth/settings')
      return this.cachedSettings
    } catch {
      return null
    }
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    return this.emitter.on('authStateChange', callback)
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  async updateProfile(params: { name?: string; avatarUrl?: string; metadata?: Record<string, unknown> }): Promise<User> {
    const user = await this.transport.patch<User>('/auth/me', params, this.authHeaders())
    this.cachedUser = user
    this.emitter.emit('authStateChange', user)
    return user
  }

  async uploadAvatar(imageBlob: Blob): Promise<{ avatarUrl: string; small: string; medium: string; original: string }> {
    const result = await this.transport.uploadBinary<{
      avatarUrl: string
      small: string
      medium: string
      original: string
    }>('/auth/avatar', imageBlob, this.authHeaders())

    if (this.cachedUser) {
      this.cachedUser = { ...this.cachedUser, avatarUrl: result.avatarUrl }
      this.emitter.emit('authStateChange', this.cachedUser)
    }

    return result
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/change-password', { currentPassword, newPassword }, this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Organizations
  // ---------------------------------------------------------------------------

  async listOrgs(): Promise<Org[]> {
    return this.transport.get<Org[]>('/auth/orgs', this.authHeaders())
  }

  async createOrg(name: string, slug: string): Promise<Org> {
    return this.transport.post<Org>('/auth/orgs', { name, slug }, this.authHeaders())
  }

  async getOrg(orgId: string): Promise<Org> {
    return this.transport.get<Org>(`/auth/orgs/${orgId}`, this.authHeaders())
  }

  async updateOrg(orgId: string, params: { name?: string; avatarUrl?: string }): Promise<Org> {
    return this.transport.patch<Org>(`/auth/orgs/${orgId}`, params, this.authHeaders())
  }

  async deleteOrg(orgId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}`, this.authHeaders())
  }

  async uploadOrgAvatar(orgId: string, imageBlob: Blob): Promise<{ avatarUrl: string; small: string; medium: string; original: string }> {
    return this.transport.uploadBinary<{
      avatarUrl: string
      small: string
      medium: string
      original: string
    }>(`/auth/orgs/${orgId}/avatar`, imageBlob, this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Members & Invites
  // ---------------------------------------------------------------------------

  async listMembers(orgId: string): Promise<Member[]> {
    return this.transport.get<Member[]>(`/auth/orgs/${orgId}/members`, this.authHeaders())
  }

  async sendInvite(orgId: string, email: string, role?: string, roleId?: string): Promise<Invite> {
    return this.transport.post<Invite>(`/auth/orgs/${orgId}/invites`, { email, role, roleId }, this.authHeaders())
  }

  async updateMemberRole(orgId: string, userId: string, role?: string, roleId?: string): Promise<void> {
    await this.transport.patch(`/auth/orgs/${orgId}/members/${userId}`, { role, roleId }, this.authHeaders())
  }

  async updateMemberRoles(orgId: string, userId: string, roles: string[]): Promise<void> {
    await this.transport.patch(`/auth/orgs/${orgId}/members/${userId}`, { roles }, this.authHeaders())
  }

  async removeMember(orgId: string, userId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/members/${userId}`, this.authHeaders())
  }

  async acceptInvite(token: string): Promise<{ orgId: string; role: string }> {
    return this.transport.post<{ orgId: string; role: string }>(`/auth/invites/${token}/accept`, undefined, this.authHeaders())
  }

  async listInvites(orgId: string): Promise<PendingInvite[]> {
    return this.transport.get<PendingInvite[]>(`/auth/orgs/${orgId}/invites`, this.authHeaders())
  }

  async revokeInvite(orgId: string, inviteId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/invites/${inviteId}`, this.authHeaders())
  }

  async listMyInvites(): Promise<MyPendingInvite[]> {
    return this.transport.get<MyPendingInvite[]>('/auth/invites/pending', this.authHeaders())
  }

  async acceptInviteById(inviteId: string): Promise<{ orgId: string; role: string }> {
    return this.transport.post<{ orgId: string; role: string }>(
      `/auth/invites/${inviteId}/accept-by-id`, undefined, this.authHeaders(),
    )
  }

  async declineInvite(inviteId: string): Promise<void> {
    await this.transport.del(`/auth/invites/${inviteId}/decline`, this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------------------

  async listRoles(): Promise<Role[]> {
    return this.transport.get<Role[]>('/auth/roles', this.authHeaders())
  }

  // ---------------------------------------------------------------------------
  // Invite Links
  // ---------------------------------------------------------------------------

  async createInviteLink(
    orgId: string,
    role?: string,
    roleId?: string,
    maxUses?: number,
  ): Promise<InviteLink> {
    return this.transport.post<InviteLink>(
      `/auth/orgs/${orgId}/invite-links`,
      { role, roleId, maxUses: maxUses ?? 0 },
      this.authHeaders(),
    )
  }

  async listInviteLinks(orgId: string): Promise<InviteLink[]> {
    return this.transport.get<InviteLink[]>(
      `/auth/orgs/${orgId}/invite-links`,
      this.authHeaders(),
    )
  }

  async revokeInviteLink(orgId: string, linkId: string): Promise<void> {
    await this.transport.del(
      `/auth/orgs/${orgId}/invite-links/${linkId}`,
      this.authHeaders(),
    )
  }

  async getInviteLinkInfo(code: string): Promise<InviteLinkInfo> {
    return this.transport.get<InviteLinkInfo>(`/auth/invite-links/${code}/info`)
  }

  async useInviteLink(code: string): Promise<UseInviteLinkResult> {
    return this.transport.post<UseInviteLinkResult>(
      `/auth/invite-links/${code}/use`,
      undefined,
      this.authHeaders(),
    )
  }

  /**
   * Fetch public info about an invite by code. Works for both per-email
   * AuthInvite raw tokens and reusable AuthInviteLink codes. Unauthenticated.
   */
  async getInviteInfo(code: string): Promise<InviteInfo> {
    return this.transport.get<InviteInfo>(`/auth/invites/info/${encodeURIComponent(code)}`)
  }

  /**
   * Accept an invite by code (per-email token OR reusable link code) for the
   * authenticated user. Creates the membership atomically.
   */
  async acceptInviteByCode(code: string): Promise<AcceptInviteByCodeResult> {
    return this.transport.post<AcceptInviteByCodeResult>(
      `/auth/invites/code/${encodeURIComponent(code)}/accept`,
      undefined,
      this.authHeaders(),
    )
  }

  async deleteAccount(): Promise<void> {
    await this.transport.del('/auth/account', this.authHeaders())
    this.clearSession()
  }

  // ---------------------------------------------------------------------------
  // API Keys (end-user programmatic credentials, scoped to one org membership)
  // ---------------------------------------------------------------------------

  async listApiKeys(orgId: string): Promise<ApiKey[]> {
    return this.transport.get<ApiKey[]>(
      `/auth/orgs/${orgId}/api-keys`,
      this.authHeaders(),
    )
  }

  async createApiKey(orgId: string, input: CreateApiKeyInput): Promise<CreatedApiKey> {
    return this.transport.post<CreatedApiKey>(
      `/auth/orgs/${orgId}/api-keys`,
      input,
      this.authHeaders(),
    )
  }

  async revokeApiKey(orgId: string, keyId: string): Promise<void> {
    await this.transport.del(
      `/auth/orgs/${orgId}/api-keys/${keyId}`,
      this.authHeaders(),
    )
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  /** @internal Called when another tab logs out (via storage event). */
  handleExternalLogout(): void {
    this.cachedUser = null
    this.emitter.emit('authStateChange', null)
  }

  /** @internal */
  async performRefresh(): Promise<void> {
    const refreshToken = this.tokenManager?.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token')

    const result = await this.transport.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    )

    this.tokenManager!.setTokens(result.accessToken, result.refreshToken)

    if (!this.cachedUser) {
      try {
        this.cachedUser = await this.transport.get<User>('/auth/me', { 'Authorization': `Bearer ${result.accessToken}` })
        this.emitter.emit('authStateChange', this.cachedUser)
      } catch {
        // User fetch failed; continue without cached user.
      }
    }
  }

  private setSession(result: SignInResult | SignUpResult): void {
    this.tokenManager?.setTokens(result.accessToken, result.refreshToken)
    this.cachedUser = result.user
    this.emitter.emit('authStateChange', result.user)

    // Fetch fresh profile from /me in background to ensure complete data
    // (avatar, name, etc. that may differ from the login/register response).
    this.refreshUser()
  }

  private clearSession(): void {
    this.tokenManager?.clearTokens()
    this.cachedUser = null
    this.emitter.emit('authStateChange', null)
  }

  private authHeaders(): Record<string, string> {
    const token = this.tokenManager?.getAccessToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
}
