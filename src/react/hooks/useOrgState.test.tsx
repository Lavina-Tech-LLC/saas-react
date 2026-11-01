import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { Org, User } from '../../auth/types';
import type { SaaSSupport } from '../../core/client';
import { createTranslate } from '../../i18n';
import { testUser } from '../../test/render';
import { SaaSContext } from '../context';
import { useOrgState } from './useOrgState';

const acme: Org = { id: 'o1', projectId: 'p1', name: 'Acme', slug: 'acme', role: 'member' };
const globex: Org = { id: 'o2', projectId: 'p1', name: 'Globex', slug: 'globex', role: 'member' };

function render(listOrgs: () => Promise<Org[]>, user: User | null = testUser) {
  const client = {
    auth: { listOrgs, listRoles: async () => [], listMembers: async () => [] },
  } as unknown as SaaSSupport;
  const value = { client, user, isLoaded: true, settings: null, locale: 'en' as const, t: createTranslate('en') };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SaaSContext.Provider value={value}>{children}</SaaSContext.Provider>
  );
  // Every state an app sees, render by render
  const seen: { isLoaded: boolean; orgId: string | null }[] = [];
  const hook = renderHook(
    () => {
      const state = useOrgState();
      seen.push({ isLoaded: state.isLoaded, orgId: state.selectedOrg?.id ?? null });
      return state;
    },
    { wrapper },
  );
  return { ...hook, seen };
}

beforeEach(() => localStorage.clear());

describe('useOrgState isLoaded', () => {
  it('is loaded only with the only org already selected — never loaded without it', async () => {
    const { result, seen } = render(async () => [acme]);
    expect(result.current.isLoaded).toBe(false);

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.selectedOrg?.id).toBe('o1');
    expect(seen.filter((s) => s.isLoaded && s.orgId === null)).toEqual([]);
  });

  it('restores the saved org among several before it says loaded', async () => {
    localStorage.setItem('ss_selected_org', 'o2');
    const { result } = render(async () => [acme, globex]);

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.selectedOrg?.id).toBe('o2');
  });

  it('is loaded with no org when there is none to pick, or when listing fails', async () => {
    const several = render(async () => [acme, globex]);
    await waitFor(() => expect(several.result.current.isLoaded).toBe(true));
    expect(several.result.current.selectedOrg).toBeNull();

    const failing = render(async () => {
      throw new Error('offline');
    });
    await waitFor(() => expect(failing.result.current.isLoaded).toBe(true));
    expect(failing.result.current.error).toBeTruthy();
  });

  it('is not loaded while nobody is signed in', async () => {
    const { result } = render(async () => [acme], null);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(result.current.isLoaded).toBe(false);
  });
});
