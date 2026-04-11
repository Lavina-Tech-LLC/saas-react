// React components and hooks entry point.
// Usage: import { SaaSProvider, SignIn, useAuth, UserButton } from '@saas-support/react/react'

// Provider + context
export { SaaSProvider } from './react/SaaSProvider'
export type { SaaSProviderProps } from './react/SaaSProvider'
export { SaaSContext, useSaaSContext } from './react/context'
export type { SaaSContextValue } from './react/context'

// Auth components + hooks
export { SignIn } from './auth/react'
export type { SignInProps } from './auth/react'
export { UserButton } from './auth/react'
export type { UserButtonProps } from './auth/react'
export { SettingsPanel } from './auth/react'
export type { SettingsPanelProps } from './auth/react'
export { useAuth, useUser, useSignIn, useSignUp, useOrg, useProfile, useDeleteAccount, useInvites, useInviteLink, useInvite } from './auth/react'

// Re-export core for convenience
export { SaaSSupport } from './core/client'
export { SaaSError } from './core/error'
export { isMfaRequired } from './auth/types'
export type {
  SaaSOptions,
  Appearance,
  ThemeVariables,
} from './core/types'
export type {
  User,
  SignInResult,
  SignUpResult,
  AuthResult,
  MfaRequiredResult,
  OAuthProvider,
  Org,
  Member,
  Invite,
  PendingInvite,
  MyPendingInvite,
  Role,
  InviteLink,
  InviteLinkInfo,
  UseInviteLinkResult,
  InviteInfo,
  AcceptInviteByCodeResult,
} from './auth/types'
