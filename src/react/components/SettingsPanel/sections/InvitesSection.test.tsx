import { renderWithSaaS, screen, testUser, userEvent } from '../../../../test';
import { InvitesSection } from './InvitesSection';

const invite = { id: 'i1', orgId: 'o1', orgName: 'Acme Corp', role: 'admin', expiresAt: '2026-12-01', createdAt: '' };

describe('InvitesSection', () => {
  it('says so when there are no invitations', () => {
    renderWithSaaS(<InvitesSection />, { user: testUser, invites: { invites: [] } });
    expect(screen.getByText('No pending invitations')).toBeInTheDocument();
  });

  it('accepts an invitation and refreshes the organizations', async () => {
    const accept = vi.fn(async () => ({ orgId: 'o1', role: 'admin' }));
    const refresh = vi.fn(async () => undefined);
    renderWithSaaS(<InvitesSection />, { user: testUser, invites: { invites: [invite], accept }, org: { refresh } });

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(accept).toHaveBeenCalledWith('i1');
    expect(refresh).toHaveBeenCalled();
  });

  it('declines an invitation', async () => {
    const decline = vi.fn(async () => true);
    renderWithSaaS(<InvitesSection />, { user: testUser, invites: { invites: [invite], decline } });

    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));

    expect(decline).toHaveBeenCalledWith('i1');
  });
});
