// React components and hooks entry point.
// Usage: import { SaaSProvider, SignIn, useAuth, UserButton } from '@saas-support/react/react'
//
// Components are built on Mantine and take their look from the host app's theme:
// render <SaaSProvider> inside your <MantineProvider>.

// Provider + context
export { SaaSProvider } from './react/SaaSProvider';
export type { SaaSProviderProps } from './react/SaaSProvider';
export { SaaSContext, useSaaSContext } from './react/context';
export type { SaaSContextValue } from './react/context';

// Components + hooks
export * from './react/components';
export * from './react/hooks';

// Shared types, type guards and the face capture helpers
export * from './auth/types';
export * from './auth/identifier';
export * from './auth/face/engine';
export * from './i18n';

// Re-export core for convenience
export { SaaSSupport } from './core/client';
export { SaaSError } from './core/error';
export type { SaaSOptions } from './core/types';
