import { renderWithSaaS, screen, testUser, userEvent } from '../../../test';
import { UserButton } from './UserButton';

describe('UserButton', () => {
  it('renders nothing when signed out', () => {
    renderWithSaaS(<UserButton />);
    // MantineProvider still injects its <style> tags, so check for content instead of an empty container
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('switches organization from the menu', async () => {
    const acme = { id: 'o1', name: 'Acme Corp', slug: 'acme', role: 'owner' };
    const beta = { id: 'o2', name: 'Beta LLC', slug: 'beta', role: 'member' };
    const selectOrg = vi.fn(async () => undefined);
    const onOrgChange = vi.fn();
    renderWithSaaS(<UserButton onOrgChange={onOrgChange} />, {
      user: testUser,
      selectedOrg: acme,
      org: { orgs: [acme, beta] as never, selectOrg },
    });

    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Beta LLC/ }));

    expect(selectOrg).toHaveBeenCalledWith('o2');
    expect(onOrgChange).toHaveBeenCalledWith(beta);
  });

  it('signs out and calls onSignOut', async () => {
    const signOut = vi.fn(async () => undefined);
    const onSignOut = vi.fn();
    renderWithSaaS(<UserButton onSignOut={onSignOut} />, { user: testUser, auth: { signOut } });

    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalled();
    expect(onSignOut).toHaveBeenCalled();
  });

  it('switches the app between light and dark from the menu', async () => {
    renderWithSaaS(<UserButton />, { user: testUser });

    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Dark theme' }));

    expect(await screen.findByRole('menuitem', { name: 'Light theme' })).toBeInTheDocument();
  });

  it('offers the languages only when the app can change its language', async () => {
    const onLocaleChange = vi.fn();
    const { unmount } = renderWithSaaS(<UserButton />, { user: testUser });
    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.queryByRole('menuitem', { name: /Language/ })).not.toBeInTheDocument();
    unmount();

    renderWithSaaS(<UserButton />, { user: testUser, onLocaleChange });
    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Language/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Русский' }));

    expect(onLocaleChange).toHaveBeenCalledWith('ru');
  });

  it('shows the name and organization, or just the avatar when compact', () => {
    const acme = { id: 'o1', name: 'Acme Corp', slug: 'acme', role: 'owner' };
    const { unmount } = renderWithSaaS(<UserButton />, { user: testUser, selectedOrg: acme });
    expect(screen.getByRole('button', { name: 'User menu' })).toHaveTextContent('Acme Corp');
    unmount();

    renderWithSaaS(<UserButton compact />, { user: testUser, selectedOrg: acme });
    expect(screen.getByRole('button', { name: 'User menu' })).not.toHaveTextContent('Acme Corp');
  });

  it('sends organization management to Settings instead of creating inline', async () => {
    const acme = { id: 'o1', name: 'Acme Corp', slug: 'acme', role: 'owner' };
    renderWithSaaS(<UserButton />, { user: testUser, selectedOrg: acme, org: { orgs: [acme] as never } });

    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    expect(screen.queryByPlaceholderText('New organization name')).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Manage organizations' }));

    // Settings opens on Organization (its sidebar is collapsed in jsdom's phone layout, so query hidden items too)
    expect(await screen.findByRole('button', { name: 'Organization', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
