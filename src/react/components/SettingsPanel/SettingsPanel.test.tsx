import { renderWithSaaS, screen, testUser, userEvent, within } from '../../../test';
import { SettingsPanel } from './SettingsPanel';

// jsdom ignores media queries, so the panel renders its phone layout: the sidebar opens from the header toggle
const nav = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Settings menu' }));
  return within(screen.getByRole('navigation', { name: 'Settings menu' }));
};
const tabNames = async () => (await nav()).getAllByRole('button').map((item) => item.textContent);

describe('SettingsPanel', () => {
  it('shows a member Profile, Organization (their list) and Invites', async () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', role: 'member' },
    });
    expect(await tabNames()).toEqual(['Profile', 'Organization', 'Invites']);
  });

  it('shows every tab to an owner', async () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', slug: 'acme', role: 'owner' },
    });
    expect(await tabNames()).toEqual(['Profile', 'Organization', 'People', 'API Keys', 'Invites', 'Billing']);
  });

  it('opens a role-gated defaultTab once the role allows it', async () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} defaultTab="people" />, {
      user: testUser,
      selectedOrg: { id: 'o1', name: 'Acme', role: 'admin' },
    });
    expect((await nav()).getByRole('button', { name: 'People' })).toHaveAttribute('aria-current', 'page');
  });

  it('counts pending invites on the Invites tab', async () => {
    renderWithSaaS(<SettingsPanel opened onClose={() => {}} />, {
      user: testUser,
      invites: { invites: [{ id: 'i1' }, { id: 'i2' }] as never },
    });
    expect((await nav()).getByRole('button', { name: /Invites/ })).toHaveTextContent('2');
  });

  it('opens full screen with the sidebar and closes from the back arrow', async () => {
    const onClose = vi.fn();
    renderWithSaaS(<SettingsPanel opened onClose={onClose} />, { user: testUser });
    expect((await nav()).getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClose).toHaveBeenCalled();
  });
});
