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
    // The theme is a one-of choice behind its row (LM3 §21): picking Dark marks it
    await userEvent.click(await screen.findByRole('menuitem', { name: /Theme/ }));
    const dark = await screen.findByRole('menuitemradio', { name: 'Dark' });
    await userEvent.click(dark);

    expect(dark).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute('aria-checked', 'false');
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
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Русский' }));

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

  it('keeps its own look by default and takes row styling and an avatar size from the host', () => {
    const { unmount } = renderWithSaaS(<UserButton />, { user: testUser });
    const plain = screen.getByRole('button', { name: 'User menu' });
    // Square corners, the SDK's own row
    expect(plain.style.borderRadius).toMatch(/^0(px)?$/);
    expect(plain.querySelector('.mantine-Avatar-root')).toHaveAttribute('data-size', 'md');
    unmount();

    renderWithSaaS(
      <UserButton
        navLinkProps={{ className: 'host-row', styles: { root: { borderRadius: 12 }, label: { fontWeight: 600 } } }}
        avatarSize="sm"
      />,
      { user: testUser },
    );
    const row = screen.getByRole('button', { name: 'User menu' });
    expect(row).toHaveClass('host-row');
    expect(row).toHaveStyle({ borderRadius: '12px' });
    expect(row.querySelector('.mantine-NavLink-label')).toHaveStyle({ fontWeight: '600' });
    expect(row.querySelector('.mantine-Avatar-root')).toHaveAttribute('data-size', 'sm');
  });

  it('sizes the compact avatar too', () => {
    renderWithSaaS(<UserButton compact avatarSize="lg" />, { user: testUser });
    expect(screen.getByRole('button', { name: 'User menu' }).querySelector('.mantine-Avatar-root')).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('loads Settings only when they are opened', async () => {
    renderWithSaaS(<UserButton />, { user: testUser });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'User menu' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Account settings' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
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
