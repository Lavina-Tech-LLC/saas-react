# CLAUDE.md

Guidance for working with code in this repository.

## Start of a chat — pull the latest changes first

Once per chat, before the first task, bring this repo and `../Convensions/` up to date with their remotes:

```bash
git pull --ff-only                     # this repo
git -C ../Convensions pull --ff-only   # the rule book
```

- Only once, at the start of the chat — not before every task.
- If a pull fails (diverged local commits, uncommitted changes in the way, no access), stop and tell the user what git said. Never stash, reset, rebase or force to make it pass.
- Tell the user in one line what came in (e.g. "Pulled 3 new commits in Convensions") or that both were already up to date.

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

`@saas-support/react` is the auth SDK every Lavina Tech app uses to talk to the **SaaS Support** service: a framework-free client (`AuthClient`, `SaaSSupport`) plus React components and hooks — `SaaSProvider`, `SignIn` (password, passwordless phone code via SMS / Telegram / WhatsApp, OAuth, MFA, face control, invites, password reset), `UserButton` (org switcher + settings modal), and the settings sections (profile, organization, people, API keys, invites, billing).

It is consumed **only by Lavina apps**, which all run Mantine with the LM3 theme. Its screens are built from the boilerplate's LM3 UI kit (`src/components/uiKit/`, copied unchanged) and inherit the host's theme; the only CSS it ships is the kit's own CSS Modules.

## Tech Stack

- **Runtime peers:** React 19.2, `@mantine/core` + `@mantine/hooks` 9, `lucide-react` — peer dependencies, never bundled
- **Build:** Vite+ `vp pack` (tsdown) — the `pack` block in `vite.config.ts`: `index` + `react` entries, ESM (`.js`) + CJS (`.cjs`) with their `.d.ts` / `.d.cts`, `unbundle: true` (one file per source module), `css: { inject: true }` (each kit CSS Module's JS imports its own `.css`) and `"sideEffects": ["**/*.css"]`, so an app's bundler drops what it doesn't use and splits what loads lazily; `platform: 'browser'`. Same toolchain as the boilerplate (Mantine's `vite-min-template`)
- **Tests:** Vitest 5 through Vite+ (`vp test`) + jsdom + React Testing Library
- **Language:** TypeScript 6.0 (typescript-eslint does not support 7 yet)
- **Lint / format:** ESLint 10 flat config (typescript-eslint, react-hooks v7, i18next) + Prettier 3 (`.prettierrc.json`, import sorting)

## Project-Specific Constraints

SDK-only rules that extend or override shared conventions:

- **Package manager: Yarn 4.18.1**, pinned in the repo (`.yarn/releases/`, `yarnPath` in `.yarnrc.yml`, `packageManager` in `package.json`; a global Yarn 1 hands over to it) with `nodeLinker: node-modules` and Yarn's safe defaults (no install scripts, the 1-day minimum package age) — never `bun` or `npm` (except `npm publish` in CI). Node ≥ 22.18.
- **It is a library, not an app.** No TanStack Router / Query, Axios, Zustand, or i18next: transport is `core/transport.ts` (fetch), state is React context, routing is the host's job (components take callbacks such as `onSignIn`, `onOrgChange`).
- **Never bundle a peer.** Anything imported from `react`, `react-dom`, `@mantine/*` or `lucide-react` must stay a peer dependency in `package.json` — tsdown never bundles a package listed in `peerDependencies`; check `dist/` imports them after a build. Adding a runtime dependency is a breaking decision — ask first.
- **The UI kit is the boilerplate's, copied unchanged.** `src/components/uiKit/<Name>/` folders are copied verbatim from the boilerplate (`Saas support boilerplate/frontend/src/components/uiKit/`) — same names, same CSS Modules; never rename or edit them here (fix the boilerplate, then copy again). Their small helpers come along at the same paths: `src/hooks/` (useScreen, useSwipeToClose, useVerticalWheelPassThrough), `src/styles/` (lines, spacing, iconSize, tonalEdge, tableScrollArea, m3/contrast), `src/utils/format.ts`. The SDK's own screens (`src/react/components/`) are built from the kit and LM3 (`../Convensions/frontend/LM3-design-system.md`) — kit pieces first, then theme-styled Mantine.
- **Aliases make the kit portable.** `@/*` → `src/*` and `react-i18next` → `src/lib/i18nAdapter.ts` (the kit's `useTranslation().t` served by the SDK's dictionaries), set in `tsconfig.json` paths, `vite.config.ts` `resolve.alias` and the `pack` `alias`. Kit strings (`common.close`, `common.moreActions`, …) live in the SDK's locales like any other key. The kit's extra Mantine variants (ActionIcon `standard`, Button `adaptive`) are typed in `src/types/mantineVariants.d.ts`.
- **No styles of its own beyond the kit.** No new CSS files, no Shadow DOM, no hex colors: LM3 tokens and theme defaults only, so the host theme applies. Components must work in light and dark.
- **Own i18n.** All user-facing text goes through `useT()` / `t('key')` from `src/i18n` — flat dot keys, `{var}` interpolation. `en.ts` is the source of truth; `ru.ts` and `uz.ts` are typed `Dictionary` and must have every key. The components load only the active language (`i18n/loadDictionary.ts`, `react/useDictionary.ts`): English is built in, Russian and Uzbek are dynamic imports — never import `locales/ru` or `locales/uz` statically outside `locales/index.ts` (the public `dictionaries`), or every app downloads all three again.
- **Shared state lives in `SaaSProvider`.** Org and invite state are created once (`useOrgState`, `useMyInvitesState`) and read through `OrgContext` / `InvitesContext`. Public hooks (`useOrg`, `useInvites`) only read context — never create a second copy of server state in a component.
- **Public API is a contract.** Everything exported from `src/index.ts` and `src/react.ts` is public. Changing or removing an export, a prop, or a hook return field is a **major** version bump (SemVer).
- **`AuthClient` is layered** (`auth/client/`): base → session → signIn → phone → account → orgs → `AuthClient`. Add a method to the layer that owns its domain; keep each file under 200 lines.
- **Keep the first download small.** Code that only some visits need loads on demand: the settings panel (`UserButton/LazySettingsPanel.tsx`) and the non-English languages. No module may do work on import (only the kit's `.css` files are side effects). After a size-relevant change, check the result in an app (`yarn pack`, then the app's build).
- **Tokens:** handled by `core/tokenManager.ts` only. Never log tokens, never put them in URLs.

## Commands

```bash
yarn build                      # tsc && vp pack → dist/ (index + react entries, ESM + CJS, .d.ts + .d.cts)
yarn dev                        # vp pack --watch
yarn typecheck                  # tsc
yarn lint                       # ESLint (max-lines 200; locales and tests exempt)
yarn test                       # vp test run (Vitest 5)
yarn test:watch                 # vp test
yarn format                     # Prettier write
yarn format:check               # Prettier check

# Try a local build in an app before publishing (avoids duplicate React / Mantine from yarn link)
yarn build && yarn pack -o saas-support-react-<version>.tgz
# then in the app: yarn add @saas-support/react@file:<path>/saas-support-react-<version>.tgz
```

## Structure

```
src/
  index.ts                      # Framework-free entry: SaaSSupport, AuthClient, types
  react.ts                      # React entry ("@saas-support/react/react")
  core/                         # SaaSSupport client, transport (fetch), tokenManager, eventEmitter, errors
  auth/
    client/                     # AuthClient, one layer per domain (base, session, signIn, phone, account, orgs)
    types/                      # Public types by domain (user, auth, org, invite) + index re-export
    identifier.ts               # e-mail / phone detection and payloads
    face/                       # Face capture engine (model loading, pose checks)
  i18n/                         # createTranslate + locales/{en,ru,uz}.ts
  react/
    SaaSProvider.tsx            # Loads user + settings, provides context + shared org / invite state
    context.ts, sharedState.ts  # SaaSContext, OrgContext, InvitesContext
    hooks/                      # Public hooks (useAuth, useOrg, useInvites, usePasswordReset, ...) + internal state hooks
    components/
      ui/                       # SDK building blocks (AuthCard, AuthActions, CodeInput, CopyField, RoleBadge, ...)
      SignIn/                   # Sign-in / sign-up flow, split into screens + flow hooks
      UserButton/               # Avatar menu, org switcher, opens SettingsPanel
      SettingsPanel/            # M3 full-screen dialog: SettingsNav beside the section (sm+), one pane on phones
        sections/               # Profile, Organization, People, ApiKeys, Invites, Billing
      FaceScanner/, AvatarUpload/
  components/uiKit/             # The boilerplate's LM3 kit, copied unchanged (AppAlert, BottomSheet, ConfirmDialog, ListItem, ...)
  hooks/, styles/, utils/       # The kit's helpers, copied at the boilerplate's paths
  lib/i18nAdapter.ts            # react-i18next stand-in for the kit (alias)
  types/                        # CSS Module and Mantine variant typings for the kit
  test/                         # Vitest setup, render (Mantine + host-like theme), renderWithSaaS (stub client, preset user / org / invites)
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
