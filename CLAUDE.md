# CLAUDE.md

Guidance for working with code in this repository.

## Conventions — Check First

**Before any work on this repo, verify that `../Convensions/` exists** (one level up from `SaaS react/`).

- If it exists: all frontend rules live there. Read the relevant docs before writing any code.
- **If it does not exist: stop immediately. Tell the user the Convensions folder is missing and do not continue.**

Key docs to load per task type:

| Task | Read |
|------|------|
| Any code | `../Convensions/frontend/Claude.md` — full rules, Mantine docs usage, file size |
| Any UI / JSX | `../Convensions/frontend/LM3-design-system.md` — tokens, components, modals, tables, responsive |
| Mantine components / hooks | `../Convensions/frontend/mantine/` — local v9 docs; never rely on memory or web search first |
| Types, naming, lint, format, tests | `../Convensions/frontend/typescript.md`, `naming.md`, `eslint.md`, `prettier.md`, `testing.md` |

---

## Overview

`@saas-support/react` is the auth SDK every Lavina Tech app uses to talk to the **SaaS Support** service: a framework-free client (`AuthClient`, `SaaSSupport`) plus React components and hooks — `SaaSProvider`, `SignIn` (password, phone + SMS code, OAuth, MFA, face control, invites, password reset), `UserButton` (org switcher + settings modal), and the settings sections (profile, organization, people, API keys, invites, billing).

It is consumed **only by Lavina apps**, which all run Mantine with the LM3 theme. The SDK therefore renders plain Mantine components and inherits the host's theme — it ships no styles of its own.

## Tech Stack

- **Runtime peers:** React 19.2, `@mantine/core` + `@mantine/hooks` 9, `lucide-react` — peer dependencies, never bundled
- **Build:** Vite 6 library mode + `vite-plugin-dts` (rolled-up `.d.ts`), outputs ESM + CJS
- **Tests:** Vitest 3 + jsdom + React Testing Library
- **Lint / format:** ESLint 9 flat config (typescript-eslint, react-hooks v7, i18next) + Prettier 3 (`.prettierrc.json`, import sorting)

## Project-Specific Constraints

SDK-only rules that extend or override shared conventions:

- **Package manager: Yarn** (classic) — never `bun` or `npm` (except `npm publish` in CI).
- **It is a library, not an app.** No TanStack Router / Query, Axios, Zustand, or i18next: transport is `core/transport.ts` (fetch), state is React context, routing is the host's job (components take callbacks such as `onSignIn`, `onOrgChange`).
- **Never bundle a peer.** Anything imported from `react`, `react-dom`, `@mantine/*` or `lucide-react` must stay in `EXTERNAL` in `vite.config.ts`. Adding a runtime dependency is a breaking decision — ask first.
- **No styles of its own.** No CSS files, no Shadow DOM, no hex colors: LM3 tokens and theme defaults only, so the host theme applies. Components must work in light and dark.
- **Own i18n.** All user-facing text goes through `useT()` / `t('key')` from `src/i18n` — flat dot keys, `{var}` interpolation. `en.ts` is the source of truth; `ru.ts` and `uz.ts` are typed `Dictionary` and must have every key.
- **Shared state lives in `SaaSProvider`.** Org and invite state are created once (`useOrgState`, `useMyInvitesState`) and read through `OrgContext` / `InvitesContext`. Public hooks (`useOrg`, `useInvites`) only read context — never create a second copy of server state in a component.
- **Public API is a contract.** Everything exported from `src/index.ts` and `src/react.ts` is public. Changing or removing an export, a prop, or a hook return field is a **major** version bump (SemVer).
- **`AuthClient` is layered** (`auth/client/`): base → session → signIn → account → orgs → `AuthClient`. Add a method to the layer that owns its domain; keep each file under 200 lines.
- **Tokens:** handled by `core/tokenManager.ts` only. Never log tokens, never put them in URLs.

## Commands

```bash
yarn build                      # tsc && vite build → dist/ (index + react entries, .d.ts)
yarn dev                        # vite build --watch
yarn typecheck                  # tsc
yarn lint                       # ESLint (max-lines 200; locales and tests exempt)
yarn test                       # Vitest run
yarn test:watch                 # Vitest watch
yarn format                     # Prettier write
yarn format:check               # Prettier check

# Try a local build in an app before publishing (avoids duplicate React / Mantine from yarn link)
yarn build && yarn pack --filename saas-support-react-<version>.tgz
# then in the app: "@saas-support/react": "file:<path>/saas-support-react-<version>.tgz", yarn install --force
```

## Structure

```
src/
  index.ts                      # Framework-free entry: SaaSSupport, AuthClient, types
  react.ts                      # React entry ("@saas-support/react/react")
  core/                         # SaaSSupport client, transport (fetch), tokenManager, eventEmitter, errors
  auth/
    client/                     # AuthClient, one layer per domain (base, session, signIn, account, orgs)
    types/                      # Public types by domain (user, auth, org, invite) + index re-export
    identifier.ts               # e-mail / phone detection and payloads
    face/                       # Face capture engine (model loading, pose checks)
  i18n/                         # createTranslate + locales/{en,ru,uz}.ts
  react/
    SaaSProvider.tsx            # Loads user + settings, provides context + shared org / invite state
    context.ts, sharedState.ts  # SaaSContext, OrgContext, InvitesContext
    hooks/                      # Public hooks (useAuth, useOrg, useInvites, usePasswordReset, ...) + internal state hooks
    components/
      ui/                       # Shared building blocks (AuthCard, ConfirmModal, SectionCard, CodeInput, ...)
      SignIn/                   # Sign-in / sign-up flow, split into screens + flow hooks
      UserButton/               # Avatar menu, org switcher, opens SettingsPanel
      SettingsPanel/            # Full-screen Modal: header, SettingsNav sidebar (role-gated), scrolling section
        sections/               # Profile, Organization, People, ApiKeys, Invites, Billing
      FaceScanner/, AvatarUpload/
  test/                         # Vitest setup + renderWithSaaS (stub client, preset user / org / invites)
```

## Versioning & Releases

- **SemVer.** PATCH — fixes and small visual tweaks. MINOR — new components, props, or hooks, backwards compatible. MAJOR — any breaking change to the public API (see constraints).
- Bump `"version"` in `package.json`, commit as `chore: release vX.Y.Z` with a body that explains the user-visible change for app developers, tag `vX.Y.Z`, push the tag.
- The tag triggers `.github/workflows/publish.yml` (build + `npm publish`). Run `yarn lint && yarn test && yarn build` before tagging — CI does not run them.
- Breaking releases update the "Migrating" section of `README.md`.

---

## Response Format

At the end of each response that involves code changes, include:

### Changes Made
- List modified files with brief description
- List new files created

### Mantine docs used
If the response involved any Mantine code (components, hooks, theme), list every local doc file read from `../Convensions/frontend/mantine/`, e.g.:
- `mantine/core/inputs/password-input.md`
- `mantine/hooks/state-management/use-local-storage.md`

If this section is missing from a Mantine-related response, that is a signal trained knowledge was used instead of the local docs — which is a violation of the conventions.
