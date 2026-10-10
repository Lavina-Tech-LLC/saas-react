import { renderWithSaaS, screen, testUser, userEvent } from '../../../../../test';
import { ProfileSection } from './ProfileSection';

describe('ProfileSection', () => {
  it('lists the account as settings rows', () => {
    renderWithSaaS(<ProfileSection />, { user: testUser });

    expect(screen.getByRole('heading', { name: 'Ali Karimov' })).toBeInTheDocument();
    expect(screen.getByText('Sign-in method')).toBeInTheDocument();
    expect(screen.getByText('Email and password')).toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument(); // no phone on this account
  });

  it('changes the password in a dialog and checks it before calling the server', async () => {
    const changePassword = vi.fn(async () => undefined);
    renderWithSaaS(<ProfileSection />, { user: testUser, auth: { changePassword } });

    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    await userEvent.type(screen.getByLabelText(/^Current Password/), 'old-pass-1');
    await userEvent.type(screen.getByLabelText(/^New Password/), 'new-pass-1');
    await userEvent.type(screen.getByLabelText(/^Confirm New Password/), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('deletes the account only after the email is typed', async () => {
    renderWithSaaS(<ProfileSection />, { user: testUser });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const confirm = screen.getByRole('button', { name: 'Delete account' });
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Type your email/), 'ali@example.com');
    expect(confirm).toBeEnabled();
  });
});
