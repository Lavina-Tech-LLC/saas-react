import { renderWithSaaS, screen, testUser, userEvent } from '../../../../../test';
import { OrganizationSection } from './OrganizationSection';

const acme = { id: 'o1', name: 'Acme Corp', slug: 'acme', role: 'owner' };
const beta = { id: 'o2', name: 'Beta LLC', slug: 'beta', role: 'member' };

describe('OrganizationSection', () => {
  it('invites a user with no organizations to create one', () => {
    renderWithSaaS(<OrganizationSection />, { user: testUser, org: { orgs: [] } });
    expect(screen.getByText(/Create one to get started/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New organization' })).toBeInTheDocument();
  });

  it('creates an organization from Settings and makes it current', async () => {
    const created = { id: 'o3', projectId: 'p1', name: 'Gamma Ltd', slug: 'gamma-ltd' };
    const createOrg = vi.fn(async () => created);
    const selectOrg = vi.fn(async () => undefined);
    renderWithSaaS(<OrganizationSection />, { user: testUser, org: { orgs: [], createOrg, selectOrg } });

    await userEvent.click(screen.getByRole('button', { name: 'New organization' }));
    await userEvent.type(screen.getByLabelText(/Organization Name/), 'Gamma Ltd');
    expect(screen.getByText('gamma-ltd')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(createOrg).toHaveBeenCalledWith('Gamma Ltd', 'gamma-ltd');
    expect(selectOrg).toHaveBeenCalledWith('o3');
  });

  it('switches to another organization', async () => {
    const selectOrg = vi.fn(async () => undefined);
    renderWithSaaS(<OrganizationSection />, {
      user: testUser,
      selectedOrg: acme,
      org: { orgs: [acme, beta] as never, selectOrg },
    });

    expect(screen.getByText('Current')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Switch' }));

    expect(selectOrg).toHaveBeenCalledWith('o2');
  });

  it('shows a member the list but not the owner controls', () => {
    renderWithSaaS(<OrganizationSection />, { user: testUser, selectedOrg: beta, org: { orgs: [beta] as never } });
    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.queryByText('Current organization')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('deletes the organization only after its name is typed', async () => {
    const deleteOrg = vi.fn(async () => true);
    const onOrgDeleted = vi.fn();
    renderWithSaaS(<OrganizationSection onOrgDeleted={onOrgDeleted} />, {
      user: testUser,
      selectedOrg: acme,
      org: { orgs: [acme] as never, deleteOrg },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const confirm = screen.getByRole('button', { name: 'Delete organization' });
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Type the organization name/), 'Acme Corp');
    await userEvent.click(confirm);

    expect(deleteOrg).toHaveBeenCalledWith('o1');
    expect(onOrgDeleted).toHaveBeenCalled();
  });
});
