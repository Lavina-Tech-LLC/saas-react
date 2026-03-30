import type { Transport } from '../core/transport'
import type { TokenManager } from '../core/tokenManager'
import type { EventEmitter } from '../core/eventEmitter'
import type { SaaSEvents } from '../core/client'
import type {
  User, ProjectSettings, AuthResult, SignInResult, SignUpResult,
  OAuthProvider, Org, Member, Invite, PendingInvite, MyPendingInvite, MfaSetupResult, MfaVerifyResult,
  AuthStateCallback,
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

  async signIn(email: string, password: string): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/login', { email, password })

    if ('mfaRequired' in result && result.mfaRequired) {
      return result
    }

    const signIn = result as SignInResult
    this.setSession(signIn)
    return signIn
  }

  async signUp(email: string, password: string): Promise<SignUpResult> {
    const result = await this.transport.post<SignUpResult>('/auth/register', { email, password })
    this.setSession(result)
    return result
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

  async signInWithOAuth(provider: OAuthProvider): Promise<SignInResult> {
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

    return new Promise<SignInResult>((resolve, reject) => {
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
          const result = await this.transport.post<SignInResult>(
            `/auth/oauth/${provider}/callback`,
            { code: event.data.code, state: event.data.state || state },
          )
          this.setSession(result)
          resolve(result)
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

  async submitMfaCode(mfaToken: string, code: string): Promise<SignInResult> {
    const result = await this.transport.post<SignInResult>('/auth/login/mfa', { mfaToken, code })
    this.setSession(result)
    return result
  }

  // ---------------------------------------------------------------------------
  // Magic link & password reset
  // ---------------------------------------------------------------------------

  async sendMagicLink(email: string, redirectUrl: string): Promise<void> {
    await this.transport.post('/auth/magic-link/send', { email, redirectUrl })
  }

  async verifyMagicLink(token: string): Promise<SignInResult> {
    const result = await this.transport.post<SignInResult>('/auth/magic-link/verify', { token })
    this.setSession(result)
    return result
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

  // ---------------------------------------------------------------------------
  // Members & Invites
  // ---------------------------------------------------------------------------

  async listMembers(orgId: string): Promise<Member[]> {
    return this.transport.get<Member[]>(`/auth/orgs/${orgId}/members`, this.authHeaders())
  }

  async sendInvite(orgId: string, email: string, role: string): Promise<Invite> {
    return this.transport.post<Invite>(`/auth/orgs/${orgId}/invites`, { email, role }, this.authHeaders())
  }

  async updateMemberRole(orgId: string, userId: string, role: string): Promise<void> {
    await this.transport.patch(`/auth/orgs/${orgId}/members/${userId}`, { role }, this.authHeaders())
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

  async deleteAccount(): Promise<void> {
    await this.transport.del('/auth/account', this.authHeaders())
    this.clearSession()
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
