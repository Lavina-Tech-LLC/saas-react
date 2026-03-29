// React components and hooks entry point.
// Usage: import { SaaSProvider, SignIn, useAuth, PricingTable } from '@saas-support/react/react'

// Provider + context
export { SaaSProvider } from './react/SaaSProvider'
export type { SaaSProviderProps } from './react/SaaSProvider'
export { SaaSContext, useSaaSContext } from './react/context'
export type { SaaSContextValue } from './react/context'

// Auth components + hooks
export { SignIn } from './auth/react'
export type { SignInProps } from './auth/react'
export { SignUp } from './auth/react'
export type { SignUpProps } from './auth/react'
export { UserButton } from './auth/react'
export type { UserButtonProps } from './auth/react'
export { UserProfile } from './auth/react'
export type { UserProfileProps } from './auth/react'
export { OrgSwitcher } from './auth/react'
export type { OrgSwitcherProps } from './auth/react'
export { useAuth, useUser, useSignIn, useSignUp, useOrg, useProfile } from './auth/react'

// Billing components + hooks
export { PricingTable } from './billing/react'
export type { PricingTableProps } from './billing/react'
export { SubscriptionStatus } from './billing/react'
export type { SubscriptionStatusProps } from './billing/react'
export { InvoiceHistory } from './billing/react'
export type { InvoiceHistoryProps } from './billing/react'
export { UsageDisplay } from './billing/react'
export type { UsageDisplayProps } from './billing/react'
export { PaymentPortal } from './billing/react'
export type { PaymentPortalProps } from './billing/react'
export { CouponInput } from './billing/react'
export type { CouponInputProps } from './billing/react'
export { useBilling, useSubscription, useInvoices, useUsage } from './billing/react'

// Report components + hooks
export { QueryInput } from './report/react'
export type { QueryInputProps } from './report/react'
export { DataTable } from './report/react'
export type { DataTableProps } from './report/react'
export { Chart } from './report/react'
export type { ChartProps } from './report/react'
export { DashboardView } from './report/react'
export type { DashboardViewProps } from './report/react'
export { SavedQueryList } from './report/react'
export type { SavedQueryListProps } from './report/react'
export { ReportEmbed } from './report/react'
export type { ReportEmbedProps } from './report/react'
export { useReport, useQuery, useSavedQueries, useDashboard, useEmbedDashboard } from './report/react'

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
} from './auth/types'
