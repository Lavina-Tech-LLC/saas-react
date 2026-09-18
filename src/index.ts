// Vanilla entry point (no React dependency).
// Usage: import { SaaSSupport, AuthClient } from '@saas-support/react'
//
// The auth modules are re-exported wholesale rather than name by name: each of
// those files is already a curated public surface, and listing their exports
// again here only created a second place to forget to update.

export { SaaSSupport } from './core/client'
export type { SaaSEvents } from './core/client'
export { SaaSError } from './core/error'
export { Transport } from './core/transport'
export type { AuthMode } from './core/transport'
export type { SaaSOptions, Appearance, ThemeVariables, ElementOverrides } from './core/types'

// Auth
export { AuthClient } from './auth/client'
export * from './auth/types'
export * from './auth/identifier'
export * from './auth/face/engine'
export * from './i18n'
