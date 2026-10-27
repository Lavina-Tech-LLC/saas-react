# @saas-support/react

Auth SDK for [SaaS Support](https://saas-support.com) — drop-in sign-in, user menu, and settings components for Lavina apps. Built on **Mantine 9**: every component takes its look from your app's Mantine theme, so it matches the rest of your interface automatically.

```bash
yarn add @saas-support/react
```

**Requires** React ≥ 19.2, `@mantine/core` + `@mantine/hooks` 9, and `lucide-react` — all provided by your app (peer dependencies).

## Quick Start

Render `<SaaSProvider>` **inside** your `<MantineProvider>`:

```tsx
import { MantineProvider } from '@mantine/core'
import { SaaSProvider, SignIn, UserButton } from '@saas-support/react/react'

function App() {
  return (
    <MantineProvider theme={theme}>
      <SaaSProvider publishableKey="pub_live_..." baseUrl="https://api.example.com/v1">
        <UserButton />
      </SaaSProvider>
    </MantineProvider>
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

```tsx
<SaaSProvider publishableKey="pub_live_..." baseUrl="https://api.saas-support.com/v1" locale={i18n.language}>
  <App />
</SaaSProvider>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `publishableKey` | `string` | No* | Publishable key for auth operations |
| `apiKey` | `string` | No* | API key for server-side operations |
| `baseUrl` | `string` | No | API base URL override |
| `locale` | `string` | No | UI language: `en`, `ru` or `uz` (regional tags like `ru-RU` are accepted) |
| `onLocaleChange` | `(locale: 'en' \| 'ru' \| 'uz') => void` | No | Adds a **Language** picker to `UserButton`'s menu. Change your app's language here; the SDK follows through `locale`, so both switch together |

\* At least one of `publishableKey` or `apiKey` is required.

The provider also holds the organization and invitation state, so every `useOrg()` / `useInvites()` call — and every component — sees the same data.

### Language

Every string the components render is available in English, Russian and Uzbek.
The language is resolved in this order, most explicit first:

1. the `locale` prop above — pass your app's current language to keep the
   sign-in screen in step with the rest of your interface;
2. the project's default language, set in the SaaS Support dashboard;
3. the browser's language;
4. English.

```tsx
const { i18n } = useTranslation()

<SaaSProvider
  publishableKey="pub_live_..."
  locale={i18n.language}
  onLocaleChange={(locale) => i18n.changeLanguage(locale)}
>
  <App />
</SaaSProvider>
```

Messages returned by the API (for example "Invalid email or password") are
worded by the server and are not translated by the SDK.

---

## Invitations

`sendInvite` addresses an invite to an e-mail or a phone number, whichever the
project accepts, and returns a ready-made link. Nothing is delivered — pass the
link on however you like.

```tsx
const invite = await client.auth.sendInvite(orgId, '+992901112233', 'admin', undefined, 'phone')
// invite.url — send this to the person
```

Somebody who opens the link registers and joins the organization in the same
step, with the role they were invited with. This works even on a project that
has self-service registration switched off.

A shared invite link (`createInviteLink`) can be handed to a group. If a person
was also invited individually, their personal role wins; everybody else gets the
link's own role.

Re-inviting the same person replaces their pending invite with a fresh link —
the previous token cannot be recovered.

### Where invite links point

Invite links are built from the project's **Invite Link Base URL**, which should
name the page that renders `<SignIn />`. Write it as a path:

```
/login
```

A path is resolved against the host the app is running on, so the same setting
yields `https://app.example.com/login?invite_code=…` in production and
`http://localhost:5173/login?invite_code=…` on a developer machine. An absolute
URL works too, but pins every invite to that one environment.

Left empty, the API can only return a bare `?invite_code=…` and the link is
resolved against the page the inviter happens to be on — usually a dashboard
rather than the sign-in route, which means the invitee lands somewhere that
never reads the code.

---

## Components

### `<SignIn />`

Sign-in and sign-up with OAuth, MFA, phone codes (SMS, Telegram, WhatsApp), face verification, invites, and password reset.

```tsx
import { SignIn } from '@saas-support/react/react'

// Router apps: navigate client-side after sign-in
<SignIn onSignIn={() => navigate({ to: search.redirect ?? '/' })} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMode` | `'signIn' \| 'signUp'` | `'signIn'` | Starting mode |
| `onSignIn` | `(user: User) => void` | — | Called when a session starts after sign-in — use it to navigate with your router |
| `onSignUp` | `(user: User) => void` | — | Called after sign-up (falls back to `onSignIn`) |
| `afterSignInUrl` | `string` | — | Full-page redirect after sign-in, used only when `onSignIn` is not given |
| `afterSignUpUrl` | `string` | — | Full-page redirect after sign-up (falls back to `afterSignInUrl`) |
| `inviteCode` | `string` | — | Invite code; read from `?invite_code=` when omitted |
| `resetToken` | `string` | — | Token from an emailed password-reset link — shows the new-password form |
| `onPasswordReset` | `() => void` | — | Called when the user leaves the reset-link flow, so you can drop the token from your URL |

Features:
- Email or phone + password, with an Email/Phone switch when the project enables both
- **Sign-in with a phone code** (no password) when the project turns it on — see [Phone codes](#phone-codes)
- OAuth (Google, GitHub) when enabled in project settings
- MFA and phone codes with one-time-code autofill
- **Forgot password:** email accounts get a reset link (pointing back to the current page); phone accounts confirm a code (SMS, Telegram or WhatsApp) and set a new password in place
- Invite landing card for `?invite_code=` links, including sign-up into the inviting organization
- Face verification when the project enables it

When self-service registration is off, the sign-up toggle is hidden; sign-ups carrying an invite code are still accepted.

**Password-reset links:** the reset email links to the page that requested it, with the token in the URL. Read that parameter in your route and pass it as `resetToken`.

#### Phone codes

A project can deliver one-time codes by SMS, Telegram and WhatsApp. `<SignIn />` reads which ones from the project settings and needs no extra props:

| Setting | Type | Meaning |
|---------|------|---------|
| `phoneOtpChannels` | `('sms' \| 'telegram' \| 'whatsapp')[]` | Channels a code can be sent through right now, in the order to offer them. Missing from older servers |
| `phoneOtpLoginEnabled` | `boolean` | A phone number and a code alone sign the user in. Missing from older servers |
| `phoneOtpRequired` | `boolean` | A phone sign-up must confirm the number with a code (now also true when only a messenger channel exists) |

- **Passwordless sign-in.** With `phoneOtpLoginEnabled`, a phone number leads to one button per channel — "Get code via Telegram", "Get code via WhatsApp", "Get code via SMS". The code signs the user in; a number without an account gets one when registration is open (or an invite is attached), and then `onSignUp` fires instead of `onSignIn`, whichever tab the user was on. MFA and face verification follow as after a password sign-in. "Use password instead" (on the sign-up tab: "Set a password instead") keeps the password route one click away.
- **Sign-up confirmation and password reset by phone.** With several channels the user picks where the code goes; with one it is used directly.
- **Another way.** When the number is not on the chosen messenger, or the channel is down for now, the screen says so and the other channels stay on offer.
- Messenger messages are written in the SDK's current language. An older server (no `phoneOtpChannels`) keeps the SMS-only behaviour of 1.0.

### `<FaceScanner />`

Guided camera capture for face verification. `<SignIn />` and the settings panel render it themselves, so you only need it for a custom flow.

```tsx
<FaceScanner
  poses={['center', 'left', 'right']}
  title="Set up face verification"
  confirmLabel="Allow camera and start"
  onComplete={(samples) => client.auth.enrollFace(samples)}
/>
```

- The camera image never leaves the browser: each pose is reduced to a 128-number descriptor, and only that is sent to the API.
- `getUserMedia` requires a secure context — HTTPS or `localhost`.
- The recognition model (a few MB) is fetched from a CDN the first time the scanner runs; nothing is added to your bundle. Point `faceModelUrl` in the project settings at your own host to avoid the public CDN.
- Matching happens server-side. It stops a user from handing their password to a colleague; it is not a defence against someone calling the API with a stolen descriptor.

### `<UserButton />`

A sidebar row — avatar, name and organization, ⇅ — opening a menu with your account, the org switcher, account settings, preferences and sign-out. **Preferences** switches the app between light and dark (through your `MantineProvider`) and — when `SaaSProvider` has `onLocaleChange` — the language.

```tsx
<UserButton
  onSignOut={() => navigate({ to: '/login' })}
  onOrgChange={(org) => console.log('Switched to', org.name)}
  onOrgSettingsClick={(org) => navigate({ to: '/org/$slug/settings', params: { slug: org.slug } })}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSignOut` | `() => void` | — | Called after sign-out — navigate with your router here |
| `afterSignOutUrl` | `string` | — | Full-page redirect after sign-out |
| `afterDeleteAccountUrl` | `string` | — | Full-page redirect after account deletion |
| `showOrgSwitcher` | `boolean` | `true` | Show the organization list and a "Manage organizations" item (opens Settings → Organization, where organizations are created) |
| `onOrgChange` | `(org: Org) => void` | — | Called when the user switches or creates an org |
| `onOrgSettingsClick` | `(org: Org) => void` | — | Adds an "Organization settings" item |
| `compact` | `boolean` | `false` | Just the avatar (with the invite count) — for a navigation rail or a tight header; the menu is the same |
| `navLinkProps` | `UserButtonNavLinkProps` | — | Restyles the sidebar row to fit your design: Mantine style props, `className`, `classNames`, `styles` (NavLink Styles API: `root`, `label`, `description`, `section`, …). Each replaces the SDK's default for it (`h="100%"`, `px="md"`, square corners). Not used when `compact` |
| `avatarSize` | `MantineSize \| number` | `'md'` | The avatar's size, in the row and when `compact` |

Without these two props the button keeps the SDK's own look. A sidebar in another design passes them instead of overriding the SDK's styles in CSS:

```tsx
<UserButton
  avatarSize={36}
  navLinkProps={{
    px: 'xs',
    styles: { root: { borderRadius: 'var(--mantine-radius-md)' }, label: { fontWeight: 600 } },
  }}
/>
```

### `<SettingsPanel />`

Settings as a full-screen page (a full-screen Modal: header with back, title and ✕; a sidebar of sections on the left, the section in a centered column that scrolls on its own; below 992px the sidebar folds behind a menu toggle in the header): profile, organization, people, API keys, invites, billing. Each tab is a column of settings rows; tabs follow the user's role in the selected organization. Opened by `<UserButton>`, or standalone:

```tsx
<SettingsPanel opened={opened} onClose={close} defaultTab="people" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opened` | `boolean` | **required** | Whether the settings page is open |
| `onClose` | `() => void` | **required** | Close callback |
| `defaultTab` | `SettingsTab` | `'profile'` | Tab to open on; role-gated tabs open once the user's role is known |
| `afterDeleteAccountUrl` | `string` | — | Full-page redirect after account deletion |
| `onOrgDeleted` | `() => void` | — | Called after an org is deleted |
| `onOrgUpdated` | `() => void` | — | Called after an org is renamed or gets a new avatar |

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

// A project may also require face verification. `<SignIn />` handles this for
// you; in a custom flow, capture a descriptor and finish the sign-in with it.
if (result && isFaceRequired(result)) {
  if (result.enrolled) {
    await client.auth.verifyFace(result.faceToken, descriptor)
  } else {
    await client.auth.enrollFace(samples, { faceToken: result.faceToken })
  }
}

// Phone sign-in. The third argument is optional — without it the identifier is
// classified by shape — but pass it when your form already knows.
await signIn('+992901112233', password, 'phone')

// Passwordless: a "login" code from usePhoneOtp().send(phone, 'login', { channel }).
// `isNewUser` is set when the code created the account.
const phoneResult = await signInWithPhoneCode('+992901112233', code, { faceChallenge: true })
if (phoneResult && isMfaRequired(phoneResult)) await submitMfaCode(phoneResult.mfaToken, mfaCode)

await signInWithOAuth('google') // or 'github'
```

### `usePhoneOtp()`

One-time codes sent to a phone number — the step behind phone sign-up confirmation, password reset by phone and passwordless sign-in.

```tsx
const { send, resend, verify, reset, otpToken, channel, resendAfterSeconds, unavailable, isLoading, error } = usePhoneOtp()

// `channel` is one of settings.phoneOtpChannels; omit it on a server that does not list them.
// `locale` sets the language of the messenger message.
const outcome = await send('+992901112233', 'login', { channel: 'telegram', locale: 'ru' })

if (outcome.status === 'error' && outcome.reason === 'notReachable') {
  // The number is not on Telegram — offer another channel
} else if (outcome.status === 'error' && outcome.reason === 'channelUnavailable') {
  // Telegram cannot send right now — offer another channel
} else if (outcome.status === 'unavailable') {
  // The project has no channel at all: go on without a code
}

await resend() // the same number, purpose and channel as the last send
```

| Purpose | Then |
|---------|------|
| `'register'` | `verify(phone, code)` → pass `otpToken` to `signUp` |
| `'reset'` | `verify(phone, code, 'reset')` → `usePasswordReset().resetByPhone` |
| `'login'` | `useSignIn().signInWithPhoneCode(phone, code)` |

`send` also takes `inviteCode` in its options: it lets a `'login'` code reach a new number while self-service registration is closed.

### `useSignUp()`

Programmatic sign-up.

```tsx
const { signUp, isLoading, error, setError } = useSignUp()
await signUp(email, password)

// Register through an invite: the user joins the inviting organization and no
// personal organization is created. Works even when registration is disabled.
await signUp(email, password, inviteCode)

// Register with a phone number.
await signUp('+992901112233', password, undefined, 'phone')

// On a project that requires face verification, ask for the face challenge:
// the session then comes with the enrollment, so nobody is signed in before
// the scan. Without `faceChallenge` a session is returned right away, flagged
// `faceEnrollmentRequired`. `<SignIn />` does this for you.
const result = await signUp(email, password, { faceChallenge: true })
if (result && isFaceRequired(result)) {
  await client.auth.enrollFace(samples, { faceToken: result.faceToken })
}
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

### `usePasswordReset()`

The forgotten-password flows behind `<SignIn>`'s "Forgot password?" — use it to build your own reset screen.

```tsx
const { sendEmailLink, resetWithToken, resetByPhone, isLoading, error } = usePasswordReset()

await sendEmailLink('ali@example.com', `${window.location.origin}/reset`) // emails a link back to /reset
await resetWithToken(tokenFromUrl, newPassword)                           // on the /reset page
await resetByPhone(phone, verifiedOtpToken, newPassword)                  // after verifyPhoneOtp(phone, code, 'reset')
```

Each returns `true` on success; failures set `error`.

### `useSaaSContext()`

Low-level context access.

```tsx
const { client, user, isLoaded, settings, locale, t, onLocaleChange } = useSaaSContext()
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
| `signIn(identifier, password, kind?)` | `Promise<AuthResult>` |
| `signUp(identifier, password, inviteCode?, kind?)` | `Promise<SignUpResult>` |
| `signUp(identifier, password, { faceChallenge: true, ... })` | `Promise<SignUpResult \| FaceRequiredResult>` |
| `signOut()` | `Promise<void>` |
| `signInWithOAuth(provider, inviteCode?)` | `Promise<AuthResult>` |
| `sendInvite(orgId, identifier, role?, roleId?, kind?)` | `Promise<Invite>` |
| `submitMfaCode(mfaToken, code)` | `Promise<AuthResult>` |
| `sendPhoneOtp(phone, purpose?, options?)` | `Promise<PhoneOtpSendResult>` |
| `signInWithPhoneCode(phone, code, options?)` | `Promise<PhoneSignInResult>` |
| `verifyPhoneOtp(phone, code, purpose?)` | `Promise<PhoneOtpVerifyResult>` |
| `resetPasswordByPhone(phone, otpToken, newPassword)` | `Promise<void>` |
| `enrollFace(samples, options?)` | `Promise<FaceEnrollResult>` |
| `verifyFace(faceToken, descriptor)` | `Promise<SignInResult>` |
| `getFaceStatus()` | `Promise<FaceStatus>` |
| `deleteFace()` | `Promise<void>` |
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

## Styling

Components are plain Mantine components rendered in your app's tree — no Shadow DOM, no SDK stylesheet, no fonts loaded by the SDK. They follow your `MantineProvider` theme (colors, radius, fonts, light/dark), so they look like the rest of the app.

---

## Migrating from 0.x

1.0 rebuilds the UI on Mantine. Breaking changes:

| 0.x | 1.0 |
|---|---|
| Self-contained, Shadow DOM, own CSS | Mantine components styled by the host theme |
| `appearance` prop on the provider and components | Removed — style through your Mantine theme |
| Works without Mantine; React ≥ 17 | Peer deps: `@mantine/core` + `@mantine/hooks` 9, `lucide-react`, React ≥ 19.2 |
| `<SaaSProvider>` anywhere | `<SaaSProvider>` must be inside `<MantineProvider>` |
| `<SettingsPanel onClose>` full-page overlay, mounted to open | `<SettingsPanel opened onClose>` full-page settings, controlled by `opened` |
| `afterSignInUrl` accepted but ignored | Works (full-page redirect); prefer `onSignIn` for router navigation |
| "Forgot?" did nothing | Email reset link + SMS reset; pass `resetToken` on your reset route |
| `Appearance`, `ThemeVariables`, `ElementOverrides` types | Removed |

Behavior fixes in 1.0: org and invite state is shared across components (badges and tabs update immediately), `defaultTab` is respected for role-gated tabs, every action shows its loading state, errors that were hidden are shown, and every string is translated (en/ru/uz).

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

## Developing the SDK

For people changing the SDK itself. Apps install it from npm.

```bash
yarn dev                  # rebuilds dist/ on every save
yarn lint && yarn test && yarn build
```

**Try it in an app before publishing** — either:

- **Link it** while you work: in the app's `frontend/package.json` set `"@saas-support/react": "link:<path-to>/SaaS react"` and keep `yarn dev` running. The app's Vite config must dedupe `react`, `react-dom`, `@mantine/core`, `@mantine/hooks` and `lucide-react`, or the app loads two copies of them. Switch back to `"^x.y.z"` before committing the app.
- **Pack it** for a final check: `yarn build && yarn pack -o saas-support-react-<version>.tgz`, then `yarn add @saas-support/react@file:<path>/saas-support-react-<version>.tgz` in the app.

**Release:** bump `version`, commit `chore: release vX.Y.Z`, tag `vX.Y.Z` and push the tag — CI publishes to npm. Details in `CLAUDE.md` → *Versioning & Releases*.

## License

MIT
