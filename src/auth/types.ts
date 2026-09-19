import type { IdentifierKind } from './identifier'

export interface User {
  id: string
  /** Empty for accounts registered with a phone number only. */
  email: string
  /** E.164 phone number. Empty for accounts registered with an e-mail only. */
  phone?: string
  provider: string
  emailVerified: boolean
  phoneVerified?: boolean
  source?: 'self' | 'invite'
  metadata: Record<string, unknown>
  mfaEnabled?: boolean
  name?: string
  avatarUrl?: string
}

export interface ProjectSettings {
  googleEnabled: boolean
  githubEnabled: boolean
  /** @deprecated Legacy name of `emailAuthEnabled`. */
  emailEnabled: boolean
  /** Whether the project accepts an e-mail address as the login identifier. */
  emailAuthEnabled: boolean
  /** Whether the project accepts a phone number as the login identifier. */
  phoneAuthEnabled: boolean
  /** Dial code ("+992") used for numbers typed without one. */
  defaultPhoneCountryCode?: string
  /**
   * Whether a phone sign-up must carry an SMS-verified code. Already resolved
   * against the project's SMS provider status — a project that asks for
   * verification without a working provider reports `false` here.
   */
  phoneOtpRequired: boolean
  /**
   * Face control: "off", "optional" (users opt in, then it is enforced for
   * them) or "required" (everyone enrolls and verifies).
   */
  faceVerificationMode: 'off' | 'optional' | 'required'
  /** Overrides where the SDK downloads the face model weights from. */
  faceModelUrl?: string
  /**
   * Default UI language of the embedded components for this project
   * ("en" | "ru" | "uz"). A `locale` prop on `<SaaSProvider>` overrides it.
   */
  defaultLocale?: string
  mfaEnforced: boolean
  passwordMinLength: number
  emailVerification: boolean
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  orgCreationPolicy: 'anyone' | 'self_registered_only'
  inviteLinkBaseUrl?: string
  /**
   * Whether self-service sign-up is open. When false the sign-up form is
   * hidden, but registration through an invite code still works.
   */
  registrationEnabled: boolean
  /** Whether a personal organization is created for a new self-registered user. */
  createOrgOnRegistration: boolean
}

export interface SignInResult {
  user: User
  accessToken: string
  refreshToken: string
}

export interface SignUpResult {
  user: User
  accessToken: string
  refreshToken: string
  /** The project requires face control and the new user has not scanned yet. */
  faceEnrollmentRequired?: boolean
}

export interface SignUpOptions {
  /** Join the inviting organization instead of creating a personal one. */
  inviteCode?: string
  /** Which field the identifier goes into. Inferred from its shape when omitted. */
  kind?: IdentifierKind
  /** Proof of phone ownership from `verifyPhoneOtp`. */
  otpToken?: string
}

/** What a one-time code is issued for. */
export type PhoneOtpPurpose = 'register' | 'reset'

export interface PhoneOtpSendResult {
  sent: boolean
  /** Seconds until another code may be requested. */
  resendAfterSeconds: number
  /** Seconds until the delivered code stops working. */
  expiresInSeconds: number
}

export interface PhoneOtpVerifyResult {
  verified: boolean
  /** Pass to `signUp` or `resetPasswordByPhone`. */
  otpToken: string
  expiresInSeconds: number
}

export interface MfaRequiredResult {
  mfaRequired: true
  mfaToken: string
}

/**
 * Returned instead of a session when the project uses face control. The
 * sign-in is finished by `verifyFace` or, for a user who has not scanned yet,
 * by `enrollFace` with the same token.
 */
export interface FaceRequiredResult {
  faceRequired: true
  faceToken: string
  /** False when the user still has to go through the capture wizard. */
  enrolled: boolean
  /** Capture sequence for a first-time enrollment. */
  poses?: string[]
}

export type AuthResult = SignInResult | MfaRequiredResult | FaceRequiredResult

export function isMfaRequired(result: AuthResult): result is MfaRequiredResult {
  return 'mfaRequired' in result && result.mfaRequired === true
}

export function isFaceRequired(result: AuthResult): result is FaceRequiredResult {
  return 'faceRequired' in result && result.faceRequired === true
}

/** One captured head pose. Only the descriptor leaves the browser. */
export interface FaceSample {
  pose: string
  descriptor: number[]
  quality: number
}

export interface FaceStatus {
  mode: 'off' | 'optional' | 'required'
  enrolled: boolean
  enrolledAt?: string
  poseCount?: number
  lastVerifiedAt?: string
  /** Capture sequence the wizard should walk through. */
  poses: string[]
}

export interface FaceEnrollResult {
  enrolled: boolean
  poseCount?: number
  /** Present when the enrollment also completed a sign-in. */
  accessToken?: string
  refreshToken?: string
  user?: User
}

export type AuthStateCallback = (user: User | null) => void
export type OAuthProvider = 'google' | 'github'

export interface Org {
  id: string
  projectId: string
  name: string
  slug: string
  avatarUrl?: string
  metadata?: string
  planName?: string
  role?: string
  roleId?: string
}

export interface RoleInfo {
  id: string
  key: string
  name: string
}

export interface Member {
  userId: string
  email: string
  /** Set for accounts registered with a phone number. */
  phone?: string
  role: string
  roleId?: string
  roleName?: string
  roles?: RoleInfo[]
}

export interface Invite {
  inviteId: string
  /** Empty when the invite was addressed to a phone number. */
  email: string
  /** Empty when the invite was addressed to an e-mail. */
  phone?: string
  role: string
  roleId?: string
  token: string
  /** Canonical shareable invite URL, built by the backend from AuthSettings.InviteLinkBaseURL. */
  url?: string
  expiresAt: string
}

export interface PendingInvite {
  id: string
  email: string
  phone?: string
  role: string
  roleId?: string
  roleName?: string
  expiresAt: string
  createdAt: string
}

export interface MyPendingInvite {
  id: string
  phone?: string
  orgId: string
  orgName: string
  role: string
  roleId?: string
  roleName?: string
  expiresAt: string
  createdAt: string
}

export interface InviteLink {
  id: string
  code: string
  /** Canonical shareable invite URL, built by the backend from AuthSettings.InviteLinkBaseURL. */
  url?: string
  role: string
  roleId?: string
  roleName?: string
  maxUses: number
  useCount: number
  expiresAt: string
  createdAt: string
}

export interface InviteLinkInfo {
  orgName: string
  orgAvatarUrl?: string
  role: string
  roleName?: string
  expiresAt: string
}

/**
 * Unified invite info returned by GET /auth/invites/info/:code. The `code`
 * may be either a per-email AuthInvite raw token or a reusable AuthInviteLink
 * code — the backend transparently resolves which. `type` discriminates the
 * two so the UI can, e.g., pre-fill the email field for per-email invites.
 */
export interface InviteInfo {
  type: 'email' | 'link'
  orgId: string
  orgName: string
  orgAvatarUrl?: string
  role: string
  roleName?: string
  inviterName?: string
  inviterEmail?: string
  inviterAvatarUrl?: string
  /** Only populated when `type === 'email'`. */
  targetEmail?: string
  /** Set when the invite was addressed to a phone number. */
  targetPhone?: string
  expiresAt: string
}

export interface UseInviteLinkResult {
  orgId: string
  orgName: string
  role: string
  roleId?: string
}

export interface AcceptInviteByCodeResult {
  orgId: string
  orgName: string
  role: string
  roleId?: string
}

export interface Role {
  id: string
  name: string
  key: string
  description?: string
  isSystem: boolean
}

export interface MfaSetupResult {
  secret: string
  uri: string
}

export interface MfaVerifyResult {
  backupCodes: string[]
}

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  roles: RoleInfo[]
  expiresAt?: string
  lastUsedAt?: string
  createdAt: string
}

export interface CreatedApiKey extends ApiKey {
  /** Plaintext API key. Returned only at creation time and never again. */
  key: string
}

export interface CreateApiKeyInput {
  name: string
  roleIds: string[]
  /** ISO timestamp. Omit or pass null for a non-expiring key. */
  expiresAt?: string | null
}
