# @saas-support/react

Embeddable auth SDK for [SaaS Support](https://saas-support.com) — drop-in sign-in, user menu, and settings components. Shadow DOM style isolation. Full theming support.

```bash
npm install @saas-support/react
```

## Quick Start

```tsx
import { SaaSProvider, SignIn, UserButton } from '@saas-support/react/react'

function App() {
  return (
    <SaaSProvider publishableKey="pub_live_..." baseUrl="https://api.example.com/v1">
      <UserButton />
    </SaaSProvider>
  )
}
```

## Entry Points

| Import | Use |
|--------|-----|
| `@saas-support/react` | Vanilla JS client and types, no React dependency |
| `@saas-support/react/react` | React components, hooks, provider |

---

## Provider

Wrap your app in `<SaaSProvider>` to initialize the SDK:

```tsx
import { SaaSProvider } from '@saas-support/react/react'

<SaaSProvider
  publishableKey="pub_live_..."
  baseUrl="https://api.saas-support.com/v1"
  appearance={{ baseTheme: 'dark' }}
>
  <App />
</SaaSProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `publishableKey` | `string` | No* | Publishable key for auth operations |
| `apiKey` | `string` | No* | API key for server-side operations |
| `baseUrl` | `string` | No | API base URL override |
| `appearance` | `Appearance` | No | Global theme configuration |

\* At least one of `publishableKey` or `apiKey` is required.

---

## Components

### `<SignIn />`

Combined sign-in and sign-up form with OAuth support, MFA, and a built-in mode toggle.

```tsx
import { SignIn } from '@saas-support/react/react'

<SignIn
  initialMode="signIn"
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/onboarding"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMode` | `'signIn' \| 'signUp'` | `'signIn'` | Starting mode |
| `afterSignInUrl` | `string` | — | Redirect URL after sign-in |
| `afterSignUpUrl` | `string` | — | Redirect URL after sign-up |
| `appearance` | `Appearance` | — | Theme overrides |

Features:
- Email/password sign-in and sign-up
- OAuth (Google, GitHub) when enabled in project settings
- MFA verification (6-digit code)
- Built-in toggle between sign-in and sign-up modes
- Password validation against project settings

### `<UserButton />`

Avatar button that opens a dropdown with org switcher, settings, and sign-out.

```tsx
import { UserButton } from '@saas-support/react/react'

<UserButton
  showOrgSwitcher={true}
  afterSignOutUrl="/login"
  onOrgChange={(org) => console.log('Switched to', org.name)}
  onOrgSettingsClick={(org) => navigate(`/org/${org.slug}/settings`)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `afterSignOutUrl` | `string` | — | Redirect URL after sign-out |
| `afterDeleteAccountUrl` | `string` | — | Redirect URL after account deletion |
| `showOrgSwitcher` | `boolean` | `true` | Show org list in dropdown |
| `onOrgChange` | `(org: Org) => void` | — | Called when user switches org |
| `onOrgSettingsClick` | `(org: Org) => void` | — | Called when "Org settings" is clicked |
| `appearance` | `Appearance` | — | Theme overrides |

Features:
- Avatar with initials fallback
- Invite notification badge
- Inline org creation
- Full settings panel (profile, organization, people, invites, billing)

### `<SettingsPanel />`

Full-page settings overlay with tabs for profile, organization, people, invites, and billing. Typically opened by `<UserButton>` but can be used standalone.

```tsx
import { SettingsPanel } from '@saas-support/react/react'

<SettingsPanel
  onClose={() => setShowSettings(false)}
  defaultTab="profile"
  afterDeleteAccountUrl="/login"
  onOrgDeleted={refreshOrgs}
  onOrgUpdated={refreshOrgs}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClose` | `() => void` | **required** | Close callback |
| `defaultTab` | `SettingsTab` | `'profile'` | Initial active tab |
| `afterDeleteAccountUrl` | `string` | — | Redirect after account deletion |
| `onOrgDeleted` | `() => void` | — | Callback when org is deleted |
| `onOrgUpdated` | `() => void` | — | Callback when org is updated |

---

## Hooks

### `useAuth()`

Primary auth state hook.

```tsx
const { isLoaded, isSignedIn, user, signOut, getToken, refreshUser } = useAuth()
```

| Return | Type | Description |
|--------|------|-------------|
| `isLoaded` | `boolean` | SDK has finished loading |
| `isSignedIn` | `boolean` | User is authenticated |
| `user` | `User \| null` | Current user object |
| `signOut` | `() => Promise<void>` | Sign out |
| `getToken` | `() => string` | Get current access token |
| `refreshUser` | `() => Promise<User \| null>` | Refresh user data from server |

### `useUser()`

Lightweight user-only hook (no methods).

```tsx
const { user, isLoaded } = useUser()
```

### `useSignIn()`

Programmatic sign-in.

```tsx
const { signIn, signInWithOAuth, submitMfaCode, isLoading, error, setError } = useSignIn()

const result = await signIn(email, password)
if (result && isMfaRequired(result)) {
  await submitMfaCode(result.mfaToken, code)
}

await signInWithOAuth('google') // or 'github'
```

### `useSignUp()`

Programmatic sign-up.

```tsx
const { signUp, isLoading, error, setError } = useSignUp()
await signUp(email, password)
```

### `useOrg()`

Organization management.

```tsx
const {
  orgs,              // Org[]
  selectedOrg,       // Org | null
  members,           // Member[]
  invites,           // PendingInvite[]
  selectOrg,         // (orgId: string) => Promise<void>
  createOrg,         // (name: string, slug: string) => Promise<Org | null>
  updateOrg,         // (orgId: string, params) => Promise<Org | null>
  deleteOrg,         // (orgId: string) => Promise<boolean>
  sendInvite,        // (orgId, email, role) => Promise<Invite | null>
  revokeInvite,      // (orgId, inviteId) => Promise<boolean>
  updateMemberRole,  // (orgId, userId, role) => Promise<boolean>
  removeMember,      // (orgId, userId) => Promise<boolean>
  refresh,
  isLoading,
  error,
} = useOrg()
```

### `useProfile()`

Profile management with avatar upload.

```tsx
const { user, updateProfile, uploadAvatar, changePassword, isLoading, error, success } = useProfile()

await updateProfile({ name: 'New Name' })
await uploadAvatar(imageBlob)
await changePassword(currentPassword, newPassword)
```

### `useInvites()`

Pending invite notifications for the current user.

```tsx
const { invites, accept, decline, refresh, isLoading, error } = useInvites()

await accept(inviteId)   // Accept org invitation
await decline(inviteId)  // Decline org invitation
```

### `useDeleteAccount()`

Account deletion.

```tsx
const { deleteAccount, isLoading, error } = useDeleteAccount()
await deleteAccount()
```

### `useSaaSContext()`

Low-level context access.

```tsx
const { client, user, isLoaded, appearance, settings } = useSaaSContext()
```

---

## Vanilla JS (No React)

Use the client directly without React:

```ts
import { SaaSSupport } from '@saas-support/react'

const saas = new SaaSSupport({ publishableKey: 'pub_live_...' })

await saas.load()
const result = await saas.auth.signIn('user@example.com', 'password')
const user = await saas.auth.getUser()

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
| `getToken()` | `Promise<string \| null>` |
| `getUser()` | `Promise<User \| null>` |
| `refreshUser()` | `Promise<User \| null>` |
| `updateProfile(params)` | `Promise<User>` |
| `uploadAvatar(imageBlob)` | `Promise<{ url }>` |
| `changePassword(current, new)` | `Promise<void>` |
| `deleteAccount()` | `Promise<void>` |
| `getSettings()` | `Promise<ProjectSettings>` |
| `listOrgs()` | `Promise<Org[]>` |
| `getOrg(orgId)` | `Promise<Org>` |
| `createOrg(name, slug)` | `Promise<Org>` |
| `updateOrg(orgId, params)` | `Promise<Org>` |
| `deleteOrg(orgId)` | `Promise<void>` |
| `listMembers(orgId)` | `Promise<Member[]>` |
| `updateMemberRole(orgId, userId, role)` | `Promise<void>` |
| `removeMember(orgId, userId)` | `Promise<void>` |
| `sendInvite(orgId, email, role)` | `Promise<Invite>` |
| `listInvites(orgId)` | `Promise<PendingInvite[]>` |
| `revokeInvite(orgId, inviteId)` | `Promise<void>` |
| `listMyInvites()` | `Promise<MyPendingInvite[]>` |
| `acceptInviteById(inviteId)` | `Promise<{ orgId, role }>` |
| `declineInvite(inviteId)` | `Promise<void>` |

---

## Theming

All components render inside Shadow DOM for style isolation. Customize via the `appearance` prop:

```tsx
<SaaSProvider
  publishableKey="pub_live_..."
  appearance={{
    baseTheme: 'dark',
    variables: {
      colorPrimary: '#8b5cf6',
      colorBackground: '#0f172a',
      colorText: '#f1f5f9',
      fontFamily: '"Inter", sans-serif',
      borderRadius: '12px',
    },
    elements: {
      card: { boxShadow: '0 4px 24px rgba(0,0,0,0.3)' },
      submitButton: { fontWeight: 700 },
    },
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  }}
>
```

Set `fontUrl: null` to disable CDN font loading.

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
| `fontFamily` | `-apple-system, ...` | `-apple-system, ...` |
| `borderRadius` | `8px` | `8px` |

---

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
  }
}
```

## Token Storage

- **Access token**: stored in memory (XSS-safe)
- **Refresh token**: stored in localStorage as `ss_rt_<first12chars>`
- Token refresh is automatic and transparent

## License

MIT
