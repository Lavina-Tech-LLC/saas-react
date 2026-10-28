import type * as screens from '@/hooks/useScreen';
import { useBelow } from '@/hooks/useScreen';

import { renderWithSaaS, screen, testUser, userEvent, within } from '../../../test';
import { SettingsPanel } from './SettingsPanel';

vi.mock('@/hooks/useScreen', async (importOriginal) => ({
  ...(await importOriginal<typeof screens>()),
  useBelow: vi.fn(() => false),
}));

// Wide screens (the default here): the sections listed beside the open one
const nav = () => within(screen.getByRole('navigation', { name: 'Settings menu' }));
const tabNames = () =>
  nav()
    .getAllByRole('button')
    .map((item) => item.textContent);

describe('SettingsPanel', () => {
  beforeEach(() => vi.mocked(useBelow).mockReturnValue(false));

  it('shows a member Profile, Organization (their list) and Invites', () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', role: 'member' },
    });
    expect(tabNames()).toEqual(['Profile', 'Organization', 'Invites']);
  });

  it('shows every tab to an owner', () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', slug: 'acme', role: 'owner' },
    });
    expect(tabNames()).toEqual(['Profile', 'Organization', 'People', 'API keys', 'Invites', 'Billing']);
  });

  it('opens a role-gated defaultTab once the role allows it', () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} defaultTab="people" />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', role: 'admin' },
    });
    expect(nav().getByRole('button', { name: 'People' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
  });

  it('counts pending invites on the Invites tab', () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      invites: { invites: [{ id: 'i1' }, { id: 'i2' }] as never },
    });
    expect(nav().getByRole('button', { name: /Invites/ })).toHaveTextContent('2');
  });

  it('opens full screen on Profile and closes from its ✕', async () => {
    const onClose = vi.fn();
    renderWithSaaS(<SettingsPanel opened onClose={onClose} />, { user: testUser });
    expect(nav().getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('on phones shows one pane at a time: the sections, then one under a back arrow', async () => {
    vi.mocked(useBelow).mockReturnValue(true);
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, { user: testUser });
    const list = within(screen.getByRole('list', { name: 'Settings menu' }));

    await userEvent.click(list.getByRole('button', { name: 'Invites' }));
    expect(screen.queryByRole('list', { name: 'Settings menu' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Invites' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('list', { name: 'Settings menu' })).toBeInTheDocument();
  });
});
