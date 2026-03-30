export interface SaaSOptions {
  /** Publishable key for auth (end-user facing, pub_live_ prefix) */
  publishableKey?: string
  /** API key for billing/report operations */
  apiKey?: string
  /** Override the default API base URL */
  baseUrl?: string
}

export interface Appearance {
  baseTheme?: 'light' | 'dark'
  variables?: ThemeVariables
  elements?: ElementOverrides
  /** Custom font URL, or null to disable CDN font loading */
  fontUrl?: string | null
}

export interface ThemeVariables {
  colorPrimary?: string
  colorBackground?: string
  colorText?: string
  colorInputBackground?: string
  colorInputBorder?: string
  colorError?: string
  colorSuccess?: string
  colorWarning?: string
  fontFamily?: string
  borderRadius?: string
  colorPrimaryContainer?: string
  colorSurface?: string
  colorOnSurface?: string
  colorOutline?: string
  fontFamilyHeadline?: string
  fontFamilyBody?: string
}

export interface ElementOverrides {
  card?: React.CSSProperties
  headerTitle?: React.CSSProperties
  formField?: React.CSSProperties
  submitButton?: React.CSSProperties
  socialButton?: React.CSSProperties
  footerLink?: React.CSSProperties
  divider?: React.CSSProperties
  errorMessage?: React.CSSProperties
  pricingCard?: React.CSSProperties
  badge?: React.CSSProperties
  table?: React.CSSProperties
  tableHeader?: React.CSSProperties
  tableRow?: React.CSSProperties
  progressBar?: React.CSSProperties
  chartContainer?: React.CSSProperties
  queryInput?: React.CSSProperties
  dashboardGrid?: React.CSSProperties
  brandIcon?: React.CSSProperties
  oauthGrid?: React.CSSProperties
  mfaDigitInput?: React.CSSProperties
  glassPanel?: React.CSSProperties
  avatarLarge?: React.CSSProperties
  profileHeader?: React.CSSProperties
}
