# @saas-support/react

Unified embeddable SDK for [SaaS Support](https://saas-support.com) — drop-in auth, billing, and reporting components for your React app. Zero external dependencies. Shadow DOM style isolation. Full theming support.

```bash
npm install @saas-support/react
```

## Quick Start

```tsx
import { SaaSProvider, SignIn, PricingTable } from '@saas-support/react/react'

function App() {
  return (
    <SaaSProvider publishableKey="pub_live_..." apiKey="sk_live_...">
      <SignIn />
    </SaaSProvider>
  )
}
```

## Entry Points

| Import | Use |
|--------|-----|
| `@saas-support/react` | Vanilla JS clients, types, no React dependency |
| `@saas-support/react/react` | React components, hooks, provider |

---

## Provider

Wrap your app in `<SaaSProvider>` to initialize the SDK:

```tsx
import { SaaSProvider } from '@saas-support/react/react'

<SaaSProvider
  publishableKey="pub_live_..."   // Auth (end-user facing)
  apiKey="sk_live_..."            // Billing & Reports (server-side or trusted client)
  baseUrl="https://api.saas-support.com/v1"
  appearance={{ baseTheme: 'dark' }}
>
  <App />
</SaaSProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `publishableKey` | `string` | No* | Publishable key for auth operations |
| `apiKey` | `string` | No* | API key for billing/report operations |
| `baseUrl` | `string` | No | API base URL override |
| `appearance` | `Appearance` | No | Global theme configuration |

\* At least one of `publishableKey` or `apiKey` is required.

---

## Authentication

### Components

#### `<SignIn />`

Pre-built sign-in form with email/password, OAuth buttons, and MFA support.

```tsx
import { SignIn } from '@saas-support/react/react'

<SignIn
  signUpUrl="/register"
  afterSignInUrl="/dashboard"
  onSignUp={() => navigate('/register')}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `signUpUrl` | `string` | — | URL for the sign-up link |
| `afterSignInUrl` | `string` | — | Redirect URL after sign-in |
| `onSignUp` | `() => void` | — | Callback when sign-up link is clicked |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<SignUp />`

Registration form with email, password, confirm password, and OAuth.

```tsx
import { SignUp } from '@saas-support/react/react'

<SignUp
  signInUrl="/login"
  afterSignUpUrl="/onboarding"
  onSignIn={() => navigate('/login')}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `signInUrl` | `string` | — | URL for the sign-in link |
| `afterSignUpUrl` | `string` | — | Redirect URL after sign-up |
| `onSignIn` | `() => void` | — | Callback when sign-in link is clicked |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<UserButton />`

Avatar dropdown showing the signed-in user with a sign-out option.

```tsx
import { UserButton } from '@saas-support/react/react'

<UserButton afterSignOutUrl="/login" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `afterSignOutUrl` | `string` | — | Redirect URL after sign-out |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<UserProfile />`

Read-only profile card showing email, provider, and verification status.

```tsx
import { UserProfile } from '@saas-support/react/react'

<UserProfile />
```

#### `<OrgSwitcher />`

Dropdown to switch between the user's organizations.

```tsx
import { OrgSwitcher } from '@saas-support/react/react'

<OrgSwitcher onOrgChange={(org) => console.log('Switched to', org.name)} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onOrgChange` | `(org: Org) => void` | — | Callback when organization changes |
| `appearance` | `Appearance` | — | Theme overrides |

### Hooks

```tsx
import { useAuth, useUser, useSignIn, useSignUp, useOrg } from '@saas-support/react/react'
```

#### `useAuth()`

```tsx
const { isLoaded, isSignedIn, user, signOut, getToken } = useAuth()
```

#### `useUser()`

```tsx
const { user, isLoaded } = useUser()
```

#### `useSignIn()`

```tsx
const { signIn, signInWithOAuth, submitMfaCode, isLoading, error, setError } = useSignIn()

await signIn('user@example.com', 'password')
await signInWithOAuth('google')
await submitMfaCode(mfaToken, '123456')
```

#### `useSignUp()`

```tsx
const { signUp, isLoading, error, setError } = useSignUp()

await signUp('user@example.com', 'password')
```

#### `useOrg()`

```tsx
const { orgs, selectedOrg, members, isLoading, selectOrg, createOrg, refresh } = useOrg()

await selectOrg('org_123')
await createOrg('My Team', 'my-team')
```

---

## Billing

### Components

#### `<PricingTable />`

Responsive grid of pricing cards with features, trial badges, and selection.

```tsx
import { PricingTable } from '@saas-support/react/react'

<PricingTable
  plans={plans}
  currentPlanId="plan_123"
  onSelectPlan={(planId) => handleSubscribe(planId)}
  interval="month"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `plans` | `Plan[]` | **required** | List of available plans |
| `currentPlanId` | `string` | — | Highlight current plan |
| `onSelectPlan` | `(planId: string) => void` | **required** | Callback on plan selection |
| `interval` | `'month' \| 'year'` | — | Filter plans by billing interval |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<SubscriptionStatus />`

Displays customer's current subscription with status badge and actions.

```tsx
import { SubscriptionStatus } from '@saas-support/react/react'

<SubscriptionStatus
  customerId="cus_123"
  onChangePlan={() => showPlanModal()}
  onCancel={() => confirmCancel()}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customerId` | `string` | **required** | Customer ID |
| `portalToken` | `string` | — | Portal token for customer self-service |
| `onChangePlan` | `() => void` | — | Change plan callback |
| `onCancel` | `() => void` | — | Cancel subscription callback |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<InvoiceHistory />`

Table of invoices with date, amount, status, and PDF download links.

```tsx
import { InvoiceHistory } from '@saas-support/react/react'

<InvoiceHistory customerId="cus_123" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customerId` | `string` | **required** | Customer ID |
| `portalToken` | `string` | — | Portal token for self-service |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<UsageDisplay />`

Usage metrics with progress bars. Bars turn red when exceeding 90% of limits.

```tsx
import { UsageDisplay } from '@saas-support/react/react'

<UsageDisplay
  customerId="cus_123"
  limits={{ api_calls: 10000, storage_gb: 50 }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customerId` | `string` | **required** | Customer ID |
| `limits` | `Record<string, number>` | — | Usage limits for progress bars |
| `portalToken` | `string` | — | Portal token for self-service |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<PaymentPortal />`

Tabbed interface combining subscription status, invoice history, and usage display.

```tsx
import { PaymentPortal } from '@saas-support/react/react'

<PaymentPortal
  customerId="cus_123"
  portalToken="pt_..."
  limits={{ api_calls: 10000 }}
  onChangePlan={() => showPlanModal()}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customerId` | `string` | **required** | Customer ID |
| `portalToken` | `string` | — | Portal token for self-service |
| `limits` | `Record<string, number>` | — | Usage limits |
| `onChangePlan` | `() => void` | — | Change plan callback |
| `onCancel` | `() => void` | — | Cancel subscription callback |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<CouponInput />`

Input field to apply a coupon code.

```tsx
import { CouponInput } from '@saas-support/react/react'

<CouponInput
  customerId="cus_123"
  onApplied={(result) => console.log(result.discountType, result.amount)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `customerId` | `string` | **required** | Customer ID |
| `portalToken` | `string` | — | Portal token for self-service |
| `onApplied` | `(result: ApplyCouponResult) => void` | — | Callback after successful apply |
| `appearance` | `Appearance` | — | Theme overrides |

### Hooks

```tsx
import { useBilling, useSubscription, useInvoices, useUsage } from '@saas-support/react/react'
```

#### `useBilling()`

```tsx
const { billing } = useBilling()

await billing.createCustomer({ email: 'user@example.com', name: 'Jane' })
await billing.subscribe('cus_123', 'plan_456')
```

#### `useSubscription(customerId, portalToken?)`

```tsx
const { customer, isLoading, error, refresh } = useSubscription('cus_123')
```

#### `useInvoices(customerId, portalToken?)`

```tsx
const { invoices, isLoading, error, refresh } = useInvoices('cus_123')
```

#### `useUsage(customerId, portalToken?)`

```tsx
const { usage, isLoading, error, refresh } = useUsage('cus_123')
```

---

## Reports

### Components

#### `<QueryInput />`

Textarea for natural language or SQL queries with a mode toggle and Run button.

```tsx
import { QueryInput } from '@saas-support/react/react'

<QueryInput
  mode="both"
  onResult={(result) => console.log(result.rows)}
  placeholder="Ask a question about your data..."
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'nl' \| 'sql' \| 'both'` | `'both'` | Input mode |
| `onResult` | `(result: QueryResult) => void` | — | Callback with query results |
| `placeholder` | `string` | — | Input placeholder |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<DataTable />`

Sortable data table from query results.

```tsx
import { DataTable } from '@saas-support/react/react'

<DataTable
  columns={result.columns}
  rows={result.rows}
  sortable
  maxRows={100}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `string[]` | **required** | Column names |
| `rows` | `Record<string, unknown>[]` | **required** | Data rows |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `maxRows` | `number` | — | Max rows to display |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<Chart />`

Pure SVG chart with zero dependencies. Supports bar, line, and pie types.

```tsx
import { Chart } from '@saas-support/react/react'

<Chart
  type="bar"
  data={{ labels: ['Jan', 'Feb', 'Mar'], values: [100, 200, 150] }}
  title="Monthly Revenue"
  width={500}
  height={300}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'bar' \| 'line' \| 'pie'` | **required** | Chart type |
| `data` | `{ labels: string[]; values: number[] }` | **required** | Chart data |
| `title` | `string` | — | Chart title |
| `width` | `number` | `400` | SVG width |
| `height` | `number` | `300` | SVG height |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<DashboardView />`

Multi-widget dashboard grid with auto-refresh.

```tsx
import { DashboardView } from '@saas-support/react/react'

<DashboardView
  dashboardId="dash_123"
  refreshInterval={60}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dashboardId` | `string` | **required** | Dashboard ID |
| `embedToken` | `string` | — | Embed token for standalone use |
| `baseUrl` | `string` | — | API base URL override |
| `refreshInterval` | `number` | — | Auto-refresh interval in seconds |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<SavedQueryList />`

Browseable list of saved queries with run buttons.

```tsx
import { SavedQueryList } from '@saas-support/react/react'

<SavedQueryList
  onSelectQuery={(query) => setActiveQuery(query)}
  onRunQuery={(result) => setTableData(result)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelectQuery` | `(query: SavedQuery) => void` | — | Callback on query selection |
| `onRunQuery` | `(result: QueryResult) => void` | — | Callback with execution result |
| `appearance` | `Appearance` | — | Theme overrides |

#### `<ReportEmbed />`

Standalone embeddable dashboard viewer. **Does not require `<SaaSProvider>`** — creates its own transport with the embed token.

```tsx
import { ReportEmbed } from '@saas-support/react/react'

// Can be used anywhere, no provider needed
<ReportEmbed
  embedToken="emb_..."
  dashboardId="dash_123"
  refreshInterval={30}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `embedToken` | `string` | **required** | Embed token |
| `dashboardId` | `string` | **required** | Dashboard ID |
| `baseUrl` | `string` | `https://api.saas-support.com/v1` | API base URL |
| `refreshInterval` | `number` | — | Auto-refresh interval in seconds |
| `appearance` | `Appearance` | — | Theme overrides |

### Hooks

```tsx
import { useReport, useQuery, useSavedQueries, useDashboard, useEmbedDashboard } from '@saas-support/react/react'
```

#### `useReport()`

```tsx
const { report } = useReport()

await report.executeQuery({ naturalLanguage: 'Show top customers by revenue' })
```

#### `useQuery()`

```tsx
const { result, execute, isLoading, error } = useQuery()

const data = await execute({ sql: 'SELECT * FROM orders LIMIT 10' })
```

#### `useSavedQueries(params?)`

```tsx
const { queries, meta, isLoading, refresh } = useSavedQueries({ page: 1, perPage: 20 })
```

#### `useDashboard(dashboardId)`

```tsx
const { dashboard, isLoading, error, refresh } = useDashboard('dash_123')
```

#### `useEmbedDashboard(embedToken, dashboardId, baseUrl?)`

Standalone hook for embedded dashboards. Creates its own transport — no `<SaaSProvider>` needed.

```tsx
const { dashboard, reportClient, isLoading, refresh } = useEmbedDashboard('emb_...', 'dash_123')
```

---

## Vanilla JS (No React)

Use the client directly without React:

```ts
import { SaaSSupport } from '@saas-support/react'

const saas = new SaaSSupport({
  publishableKey: 'pub_live_...',
  apiKey: 'sk_live_...',
})

// Auth
await saas.load()
const result = await saas.auth.signIn('user@example.com', 'password')
const user = saas.auth.getUserSync()

// Billing
const customer = await saas.billing.createCustomer({ email: 'user@example.com' })
await saas.billing.subscribe(customer.id, 'plan_123')

// Reports
const data = await saas.report.executeQuery({
  naturalLanguage: 'Show revenue by month',
})

// Cleanup
saas.destroy()
```

### AuthClient Methods

| Method | Returns |
|--------|---------|
| `signIn(email, password)` | `Promise<AuthResult>` |
| `signUp(email, password)` | `Promise<SignUpResult>` |
| `signOut()` | `Promise<void>` |
| `signInWithOAuth(provider)` | `Promise<SignInResult>` |
| `submitMfaCode(mfaToken, code)` | `Promise<SignInResult>` |
| `sendMagicLink(email, redirectUrl)` | `Promise<void>` |
| `verifyMagicLink(token)` | `Promise<SignInResult>` |
| `sendPasswordReset(email, redirectUrl)` | `Promise<void>` |
| `resetPassword(token, newPassword)` | `Promise<void>` |
| `setupMfa()` | `Promise<MfaSetupResult>` |
| `verifyMfa(code)` | `Promise<MfaVerifyResult>` |
| `disableMfa(code)` | `Promise<void>` |
| `getToken()` | `Promise<string \| null>` |
| `getUser()` | `Promise<User \| null>` |
| `getUserSync()` | `User \| null` |
| `updateProfile(metadata)` | `Promise<User>` |
| `listOrgs()` | `Promise<Org[]>` |
| `createOrg(name, slug)` | `Promise<Org>` |
| `getOrg(orgId)` | `Promise<Org>` |
| `updateOrg(orgId, params)` | `Promise<Org>` |
| `deleteOrg(orgId)` | `Promise<void>` |
| `listMembers(orgId)` | `Promise<Member[]>` |
| `sendInvite(orgId, email, role)` | `Promise<Invite>` |
| `updateMemberRole(orgId, userId, role)` | `Promise<void>` |
| `removeMember(orgId, userId)` | `Promise<void>` |
| `acceptInvite(token)` | `Promise<{ orgId, role }>` |

### BillingClient Methods

| Method | Returns |
|--------|---------|
| `createCustomer(params)` | `Promise<Customer>` |
| `getCustomer(customerId)` | `Promise<Customer>` |
| `updateCustomer(customerId, params)` | `Promise<Customer>` |
| `subscribe(customerId, planId)` | `Promise<Subscription>` |
| `changePlan(customerId, planId)` | `Promise<Subscription>` |
| `cancelSubscription(customerId)` | `Promise<{ canceledAtPeriodEnd }>` |
| `getInvoices(customerId)` | `Promise<Invoice[]>` |
| `ingestUsageEvent(params)` | `Promise<{ id, ingested }>` |
| `getCurrentUsage(customerId)` | `Promise<UsageSummary[]>` |
| `createPortalToken(customerId, expiresIn?)` | `Promise<PortalTokenResult>` |
| `applyCoupon(customerId, code)` | `Promise<ApplyCouponResult>` |

### ReportClient Methods

| Method | Returns |
|--------|---------|
| `executeQuery(params)` | `Promise<QueryResult>` |
| `listQueries(params?)` | `Promise<OffsetPage<SavedQuery>>` |
| `saveQuery(params)` | `Promise<SavedQuery>` |
| `updateQuery(queryId, params)` | `Promise<SavedQuery>` |
| `deleteQuery(queryId)` | `Promise<void>` |
| `listDashboards(params?)` | `Promise<OffsetPage<Dashboard>>` |
| `createDashboard(params)` | `Promise<Dashboard>` |
| `getDashboard(dashboardId)` | `Promise<Dashboard>` |
| `updateDashboard(dashboardId, params)` | `Promise<Dashboard>` |
| `deleteDashboard(dashboardId)` | `Promise<void>` |
| `createEmbedToken(params)` | `Promise<EmbedTokenResult>` |
| `listEmbedTokens()` | `Promise<EmbedToken[]>` |
| `revokeEmbedToken(tokenId)` | `Promise<void>` |

---

## Theming

All components support theming via the `appearance` prop (per-component) or the `<SaaSProvider>` `appearance` prop (global).

```tsx
<SaaSProvider
  publishableKey="pub_live_..."
  appearance={{
    baseTheme: 'dark',
    variables: {
      colorPrimary: '#8b5cf6',
      colorBackground: '#0f172a',
      colorText: '#f1f5f9',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      fontFamily: '"Inter", sans-serif',
      borderRadius: '12px',
    },
    elements: {
      card: { boxShadow: '0 4px 24px rgba(0,0,0,0.3)' },
      submitButton: { fontWeight: 700 },
    },
  }}
>
  <App />
</SaaSProvider>
```

### Theme Variables

| Variable | Light Default | Dark Default |
|----------|--------------|--------------|
| `colorPrimary` | `#6366f1` | `#818cf8` |
| `colorBackground` | `#ffffff` | `#1e1e2e` |
| `colorText` | `#1a1a2e` | `#e2e8f0` |
| `colorInputBackground` | `#f8f9fa` | `#2a2a3e` |
| `colorInputBorder` | `#e2e8f0` | `#3a3a4e` |
| `colorError` | `#ef4444` | `#f87171` |
| `colorSuccess` | `#22c55e` | `#4ade80` |
| `colorWarning` | `#f59e0b` | `#fbbf24` |
| `fontFamily` | `-apple-system, ...` | `-apple-system, ...` |
| `borderRadius` | `8px` | `8px` |

### Element Overrides

Apply `React.CSSProperties` to specific elements:

`card`, `headerTitle`, `formField`, `submitButton`, `socialButton`, `footerLink`, `divider`, `errorMessage`, `pricingCard`, `badge`, `table`, `tableHeader`, `tableRow`, `progressBar`, `chartContainer`, `queryInput`, `dashboardGrid`

---

## Portal Tokens

Billing components accept an optional `portalToken` prop for customer self-service scenarios. This lets end-users view their own subscription, invoices, and usage without exposing your API key:

```tsx
// Server-side: generate a portal token
const { portalToken } = await billing.createPortalToken('cus_123', 3600)

// Client-side: pass it to billing components
<PaymentPortal customerId="cus_123" portalToken={portalToken} />
```

## Error Handling

All errors are thrown as `SaaSError` instances:

```ts
import { SaaSError } from '@saas-support/react'

try {
  await saas.auth.signIn(email, password)
} catch (err) {
  if (err instanceof SaaSError) {
    console.log(err.code)           // 401
    console.log(err.domain)         // 'auth'
    console.log(err.isUnauthorized) // true
    console.log(err.isNotFound)     // false
    console.log(err.isRateLimited)  // false
  }
}
```

## Style Isolation

All components render inside Shadow DOM to prevent style conflicts with your application. The SDK generates its own CSS from the resolved theme and injects it into each shadow root.

## Tree Shaking

The SDK is fully tree-shakeable. Importing only auth components won't bundle billing or report code:

```ts
// Only auth code is included in your bundle
import { SignIn, useAuth } from '@saas-support/react/react'
```

## License

MIT
