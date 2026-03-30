// Vanilla entry point (no React dependency).
// Usage: import { SaaSSupport, AuthClient } from '@saas-support/react'

export { SaaSSupport } from './core/client'
export type { SaaSEvents } from './core/client'
export { SaaSError } from './core/error'
export { Transport } from './core/transport'
export type { AuthMode } from './core/transport'
export type { SaaSOptions, Appearance, ThemeVariables, ElementOverrides } from './core/types'

// Auth
export { AuthClient } from './auth/client'
export type {
  User,
  ProjectSettings,
  SignInResult,
  SignUpResult,
  MfaRequiredResult,
  AuthResult,
  OAuthProvider,
  AuthStateCallback,
  Org,
  Member,
  Invite,
  PendingInvite,
  MyPendingInvite,
  MfaSetupResult,
  MfaVerifyResult,
} from './auth/types'
export { isMfaRequired } from './auth/types'
