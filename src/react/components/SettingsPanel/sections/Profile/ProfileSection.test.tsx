import { renderWithSaaS, screen, testUser, userEvent } from '../../../../../test';
import { ProfileSection } from './ProfileSection';

describe('ProfileSection', () => {
  it('lists the account as settings rows', () => {
    renderWithSaaS(<ProfileSection />, { user: testUser });

    expect(screen.getByText('Ali Karimov')).toBeInTheDocument();
    expect(screen.getByText('Sign-in method')).toBeInTheDocument();
    expect(screen.getByText('Email and password')).toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument(); // no phone on this account
  });

  it('changes the password in a dialog and checks it before calling the server', async () => {
    const changePassword = vi.fn(async () => undefined);
    renderWithSaaS(<ProfileSection />, { user: testUser, auth: { changePassword } });

    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    await userEvent.type(screen.getByLabelText(/^Current password/), 'old-pass-1');
    await userEvent.type(screen.getByLabelText(/^New password/), 'new-pass-1');
    await userEvent.type(screen.getByLabelText(/^Confirm new password/), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('deletes the account only after the email is typed, in a dialog that asks', async () => {
    renderWithSaaS(<ProfileSection />, { user: testUser });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog', { name: 'Delete your account?' })).toBeInTheDocument();
    const confirm = screen.getByRole('button', { name: 'Delete account' });
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Type ali@example.com to confirm'), 'ali@example.com');
    expect(confirm).toBeEnabled();
  });
});
