export interface User {
  id: string
  email: string
  provider: string
  emailVerified: boolean
  source?: 'self' | 'invite'
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
  orgCreationPolicy: 'anyone' | 'self_registered_only'
  inviteLinkBaseUrl?: string
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
  roleId?: string
  roleName?: string
}

export interface Invite {
  inviteId: string
  email: string
  role: string
  roleId?: string
  token: string
  expiresAt: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  roleId?: string
  roleName?: string
  expiresAt: string
  createdAt: string
}

export interface MyPendingInvite {
  id: string
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

export interface UseInviteLinkResult {
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
