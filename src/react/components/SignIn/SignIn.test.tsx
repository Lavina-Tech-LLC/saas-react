import { renderWithSaaS, screen, userEvent } from '../../../test';
import { SignIn } from './SignIn';

const continueWith = async (label: string | RegExp, value: string) => {
  await userEvent.type(screen.getByLabelText(label), value);
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('SignIn', () => {
  it('signs in in two steps: identifier, then password', async () => {
    const signIn = vi.fn(async () => ({ user: {}, accessToken: 'a', refreshToken: 'r' }));
    renderWithSaaS(<SignIn />, { auth: { signIn } });

    expect(screen.queryByLabelText(/^Password/)).not.toBeInTheDocument();
    await continueWith(/^Email Address/, 'ali@example.com');

    expect(screen.getByText('ali@example.com')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/^Password/), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledWith('ali@example.com', 'secret-pass', 'email');
  });

  it('keeps an incomplete identifier on the first step', async () => {
    renderWithSaaS(<SignIn />);

    await continueWith(/^Email Address/, 'ali');

    expect(screen.getByText(/Enter a full email address/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Password/)).not.toBeInTheDocument();
  });

  it('goes back to the first step from the identity chip, keeping what was typed', async () => {
    renderWithSaaS(<SignIn />);

    await continueWith(/^Email Address/, 'ali@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));

    expect(screen.getByLabelText(/^Email Address/)).toHaveValue('ali@example.com');
  });

  it('detects a phone number in the combined field', async () => {
    const signIn = vi.fn(async () => ({ user: {}, accessToken: 'a', refreshToken: 'r' }));
    renderWithSaaS(<SignIn />, { auth: { signIn }, settings: { emailAuthEnabled: true, phoneAuthEnabled: true } });

    expect(screen.queryByRole('radio', { name: 'Phone' })).not.toBeInTheDocument();
    await continueWith(/^Email or phone/, '+998901112233');
    await userEvent.type(screen.getByLabelText(/^Password/), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledWith('+998901112233', 'secret-pass', 'phone');
  });

  it('validates matching passwords on sign-up', async () => {
    const signUp = vi.fn();
    renderWithSaaS(<SignIn initialMode="signUp" />, { auth: { signUp } });

    await continueWith(/^Email Address/, 'ali@example.com');
    await userEvent.type(screen.getByLabelText(/^New password/), 'secret-pass');
    await userEvent.type(screen.getByLabelText(/^Confirm Password/), 'other-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('offers social sign-in on the first step only', async () => {
    renderWithSaaS(<SignIn />, { settings: { googleEnabled: true } });

    expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
    await continueWith(/^Email Address/, 'ali@example.com');
    expect(screen.queryByRole('button', { name: 'Google' })).not.toBeInTheDocument();
  });

  it('sends a password reset link from "Forgot password?"', async () => {
    const sendPasswordReset = vi.fn(async () => undefined);
    renderWithSaaS(<SignIn />, { auth: { sendPasswordReset } });

    await continueWith(/^Email Address/, 'ali@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.getByLabelText(/^Email Address/)).toHaveValue('ali@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(sendPasswordReset).toHaveBeenCalledWith('ali@example.com', window.location.href);
    expect(await screen.findByText(/a reset link is on its way/)).toBeInTheDocument();
  });

  it('states the legal terms as one sentence', () => {
    renderWithSaaS(<SignIn />, { settings: { termsOfServiceUrl: '/terms', privacyPolicyUrl: '/privacy' } });

    expect(screen.getByText(/By continuing, you agree to the/)).toHaveTextContent(
      'By continuing, you agree to the Terms of Service and Privacy Policy.',
    );
  });

  it('shows the new-password form for a reset token', async () => {
    const resetPassword = vi.fn(async () => undefined);
    renderWithSaaS(<SignIn resetToken="tok" />, { auth: { resetPassword } });

    await userEvent.type(screen.getByLabelText(/^New Password/), 'brand-new-pass');
    await userEvent.type(screen.getByLabelText(/^Confirm New Password/), 'brand-new-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    expect(resetPassword).toHaveBeenCalledWith('tok', 'brand-new-pass');
  });
});
