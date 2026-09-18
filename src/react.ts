// React components and hooks entry point.
// Usage: import { SaaSProvider, SignIn, useAuth, UserButton } from '@saas-support/react/react'
//
// The auth barrels are re-exported wholesale. They are curated lists in their
// own right, so repeating their contents here only created a second place to
// forget — which is exactly how FaceScanner, useFace and usePhoneOtp ended up
// missing from 0.10.0 while compiling cleanly.

// Provider + context
export { SaaSProvider } from './react/SaaSProvider'
export type { SaaSProviderProps } from './react/SaaSProvider'
export { SaaSContext, useSaaSContext } from './react/context'
export type { SaaSContextValue } from './react/context'

// Auth components + hooks
export * from './auth/react'

// Shared types, type guards and the face capture helpers
export * from './auth/types'
export * from './auth/identifier'
export * from './auth/face/engine'

// Re-export core for convenience
export { SaaSSupport } from './core/client'
export { SaaSError } from './core/error'
export type { SaaSOptions, Appearance, ThemeVariables } from './core/types'
