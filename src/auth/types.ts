export interface User {
  id: string
  email: string
  provider: string
  emailVerified: boolean
  metadata: Record<string, unknown>
  mfaEnabled?: boolean
  name?: string
  avatarUrl?: string
}

export interface ProjectSettings {
  googleEnabled: boolean
  githubEnabled: boolean
  emailEnabled: boolean
  mfaEnforced: boolean
  passwordMinLength: number
  emailVerification: boolean
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
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
}

export interface MfaRequiredResult {
  mfaRequired: true
  mfaToken: string
}

export type AuthResult = SignInResult | MfaRequiredResult

export function isMfaRequired(result: AuthResult): result is MfaRequiredResult {
  return 'mfaRequired' in result && result.mfaRequired === true
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
}

export interface Member {
  userId: string
  email: string
  role: string
}

export interface Invite {
  inviteId: string
  email: string
  role: string
  token: string
  expiresAt: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  expiresAt: string
  createdAt: string
}

export interface MyPendingInvite {
  id: string
  orgId: string
  orgName: string
  role: string
  expiresAt: string
  createdAt: string
}

export interface MfaSetupResult {
  secret: string
  uri: string
}

export interface MfaVerifyResult {
  backupCodes: string[]
}
