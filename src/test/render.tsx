import { MantineProvider } from '@mantine/core';
import { render as rtlRender } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { Org, ProjectSettings, User } from '../auth/types';
import type { SaaSSupport } from '../core/client';
import { createTranslate, type Locale } from '../i18n';
import { SaaSContext } from '../react/context';
import { InvitesContext, OrgContext, type InvitesState, type OrgState } from '../react/sharedState';

const asyncNoop = vi.fn(async () => null);

/** Every hook/client call resolves to null unless the test overrides it. */
function stubOrg(overrides: Partial<OrgState>): OrgState {
  const base = new Proxy({}, { get: () => asyncNoop }) as OrgState;
  return Object.assign(Object.create(base), {
    orgs: [],
    selectedOrg: null,
    members: [],
    invites: [],
    inviteLinks: [],
    roles: [],
    isLoading: false,
    error: null,
    setError: vi.fn(),
    getInviteLinkUrl: () => '',
    ...overrides,
  });
}

function stubInvites(overrides: Partial<InvitesState>): InvitesState {
  return {
    invites: [],
    isLoading: false,
    error: null,
    setError: vi.fn(),
    refresh: vi.fn(),
    accept: asyncNoop,
    decline: vi.fn(async () => true),
    ...overrides,
  } as InvitesState;
}

export interface SaaSTestOptions {
  user?: User | null;
  settings?: Partial<ProjectSettings>;
  selectedOrg?: Partial<Org> | null;
  org?: Partial<OrgState>;
  invites?: Partial<InvitesState>;
  /** Methods on `client.auth`; anything not given resolves to null. */
  auth?: Record<string, unknown>;
  /** Host language callback — turns on the Language picker. */
  onLocaleChange?: (locale: Locale) => void;
}

export const testUser: User = {
  id: 'u1',
  email: 'ali@example.com',
  provider: 'email',
  emailVerified: true,
  metadata: {},
  name: 'Ali Karimov',
};

/** Renders inside MantineProvider + the SDK contexts with a stubbed client — no network. */
export function renderWithSaaS(ui: ReactNode, options: SaaSTestOptions = {}) {
  const auth = new Proxy(options.auth ?? {}, {
    get: (target, key) => (target as Record<string, unknown>)[key as string] ?? asyncNoop,
  });
  const client = { auth } as unknown as SaaSSupport;
  const value = {
    client,
    user: options.user === undefined ? null : options.user,
    isLoaded: true,
    settings: (options.settings ?? {}) as ProjectSettings,
    locale: 'en' as const,
    t: createTranslate('en'),
    onLocaleChange: options.onLocaleChange,
  };
  const org = stubOrg({ selectedOrg: (options.selectedOrg as Org) ?? null, ...options.org });

  return rtlRender(
    <MantineProvider env="test">
      <SaaSContext.Provider value={value}>
        <OrgContext.Provider value={org}>
          <InvitesContext.Provider value={stubInvites(options.invites ?? {})}>{ui}</InvitesContext.Provider>
        </OrgContext.Provider>
      </SaaSContext.Provider>
    </MantineProvider>,
  );
}
