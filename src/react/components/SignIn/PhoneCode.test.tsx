import type { PhoneOtpChannel, ProjectSettings } from '../../../auth/types';
import { SaaSError } from '../../../core/error';
import { renderWithSaaS, screen, testUser, userEvent, within } from '../../../test';
import { SignIn } from './SignIn';

const PHONE = '+998901112233';
const session = { user: testUser, accessToken: 'a', refreshToken: 'r' };

// A phone-only project that signs in by code through Telegram and WhatsApp
const passwordless = (channels: PhoneOtpChannel[] = ['telegram', 'whatsapp']): Partial<ProjectSettings> => ({
  emailAuthEnabled: false,
  phoneAuthEnabled: true,
  phoneOtpLoginEnabled: true,
  phoneOtpChannels: channels,
});

const codeSent = (channel?: PhoneOtpChannel) =>
  vi.fn(async () => ({ sent: true, resendAfterSeconds: 60, expiresInSeconds: 300, channel }));

// The dial code is already in the field
const enterPhone = async () => {
  await userEvent.type(screen.getByLabelText(/^Phone Number/), '901112233');
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

const enterCode = async (group: string, code: string) => {
  const [first] = within(screen.getByRole('group', { name: group })).getAllByRole('textbox');
  await userEvent.type(first, code);
};

const chooseTelegramAndEnterCode = async (submit: string) => {
  await userEvent.click(screen.getByRole('button', { name: 'Get code via Telegram' }));
  expect(await screen.findByText(`We sent a code to ${PHONE} in Telegram`)).toBeInTheDocument();
  await enterCode('Verification Code', '123456');
  await userEvent.click(screen.getByRole('button', { name: submit }));
};

describe('SignIn with a phone code', () => {
  it('offers exactly the channels the project has', async () => {
    renderWithSaaS(<SignIn />, { settings: passwordless(['telegram', 'whatsapp']) });

    await enterPhone();

    expect(screen.getByText('Where should we send the code?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get code via Telegram' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get code via WhatsApp' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get code via SMS' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Password/)).not.toBeInTheDocument();
  });

  it('signs in with a code sent through Telegram', async () => {
    const sendPhoneOtp = codeSent('telegram');
    const signInWithPhoneCode = vi.fn(async () => session);
    const onSignIn = vi.fn();
    const onSignUp = vi.fn();
    const view = renderWithSaaS(<SignIn onSignIn={onSignIn} onSignUp={onSignUp} />, {
      auth: { sendPhoneOtp, signInWithPhoneCode },
      settings: passwordless(),
    });

    await enterPhone();
    await chooseTelegramAndEnterCode('Sign in');

    expect(sendPhoneOtp).toHaveBeenCalledWith(
      PHONE,
      'login',
      expect.objectContaining({ channel: 'telegram', locale: 'en' }),
    );
    expect(signInWithPhoneCode).toHaveBeenCalledWith(PHONE, '123456', expect.objectContaining({ faceChallenge: true }));
    view.rerenderWithSaaS({ user: testUser });
    expect(onSignIn).toHaveBeenCalledWith(testUser);
    expect(onSignUp).not.toHaveBeenCalled();
  });

  it('hands a number the code registered to onSignUp', async () => {
    const signInWithPhoneCode = vi.fn(async () => ({ ...session, isNewUser: true }));
    const onSignIn = vi.fn();
    const onSignUp = vi.fn();
    const view = renderWithSaaS(<SignIn onSignIn={onSignIn} onSignUp={onSignUp} />, {
      auth: { sendPhoneOtp: codeSent('telegram'), signInWithPhoneCode },
      settings: passwordless(),
    });

    await enterPhone();
    await chooseTelegramAndEnterCode('Sign in');

    view.rerenderWithSaaS({ user: testUser });
    expect(onSignUp).toHaveBeenCalledWith(testUser);
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it('keeps a new user on onSignUp through the face enrollment', async () => {
    const signInWithPhoneCode = vi.fn(async () => ({
      faceRequired: true,
      faceToken: 'face-t',
      enrolled: false,
      poses: ['center'],
      isNewUser: true,
    }));
    const onSignIn = vi.fn();
    const onSignUp = vi.fn();
    const view = renderWithSaaS(<SignIn onSignIn={onSignIn} onSignUp={onSignUp} />, {
      auth: { sendPhoneOtp: codeSent('telegram'), signInWithPhoneCode },
      settings: passwordless(),
    });

    await enterPhone();
    await chooseTelegramAndEnterCode('Sign in');

    expect(screen.getByText('Set up face verification')).toBeInTheDocument();
    // The enrollment starts the session
    view.rerenderWithSaaS({ user: testUser });
    expect(onSignUp).toHaveBeenCalledWith(testUser);
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it('stays on the channels when the number is not on Telegram', async () => {
    const sendPhoneOtp = vi.fn(async () => {
      throw new SaaSError(422, 'This phone number is not registered in Telegram', 'auth');
    });
    renderWithSaaS(<SignIn />, { auth: { sendPhoneOtp }, settings: passwordless() });

    await enterPhone();
    await userEvent.click(screen.getByRole('button', { name: 'Get code via Telegram' }));

    expect(await screen.findByText('This number isn’t on Telegram — try another way')).toBeInTheDocument();
    expect(screen.queryByText('This phone number is not registered in Telegram')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get code via WhatsApp' })).toBeEnabled();
  });

  it('says when a channel is down for now', async () => {
    const sendPhoneOtp = vi.fn(async () => {
      throw new SaaSError(503, 'Codes cannot be sent through WhatsApp right now', 'auth');
    });
    renderWithSaaS(<SignIn />, { auth: { sendPhoneOtp }, settings: passwordless() });

    await enterPhone();
    await userEvent.click(screen.getByRole('button', { name: 'Get code via WhatsApp' }));

    expect(await screen.findByText('WhatsApp is unavailable right now — try another way')).toBeInTheDocument();
  });

  it('goes back to the channels for the code another way', async () => {
    renderWithSaaS(<SignIn />, { auth: { sendPhoneOtp: codeSent('telegram') }, settings: passwordless() });

    await enterPhone();
    await userEvent.click(screen.getByRole('button', { name: 'Get code via Telegram' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Get the code another way' }));

    expect(screen.getByRole('button', { name: 'Get code via WhatsApp' })).toBeInTheDocument();
  });

  it('keeps the password a click away', async () => {
    const signIn = vi.fn(async () => session);
    renderWithSaaS(<SignIn />, { auth: { signIn }, settings: passwordless() });

    await enterPhone();
    await userEvent.click(screen.getByRole('button', { name: 'Use password instead' }));
    await userEvent.type(screen.getByLabelText(/^Password/), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signIn).toHaveBeenCalledWith(PHONE, 'secret-pass', 'phone');
    await userEvent.click(screen.getByRole('button', { name: 'Get a code instead' }));
    expect(screen.getByRole('button', { name: 'Get code via Telegram' })).toBeInTheDocument();
  });

  it('asks for the MFA code after the phone code, in sign-up mode too', async () => {
    const signInWithPhoneCode = vi.fn(async () => ({ mfaRequired: true, mfaToken: 'mfa-t' }));
    const submitMfaCode = vi.fn(async () => session);
    const signUp = vi.fn();
    const onSignIn = vi.fn();
    const onSignUp = vi.fn();
    const view = renderWithSaaS(<SignIn initialMode="signUp" onSignIn={onSignIn} onSignUp={onSignUp} />, {
      auth: { sendPhoneOtp: codeSent('telegram'), signInWithPhoneCode, submitMfaCode, signUp },
      settings: passwordless(),
    });

    await enterPhone();
    expect(screen.getByRole('button', { name: 'Set a password instead' })).toBeInTheDocument();
    await chooseTelegramAndEnterCode('Sign up');

    expect(await screen.findByText('Two-step verification')).toBeInTheDocument();
    await enterCode('6-Digit Code', '654321');
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(submitMfaCode).toHaveBeenCalledWith('mfa-t', '654321');
    expect(signUp).not.toHaveBeenCalled();
    // An existing account signed in, whatever the tab said
    view.rerenderWithSaaS({ user: testUser });
    expect(onSignIn).toHaveBeenCalledWith(testUser);
    expect(onSignUp).not.toHaveBeenCalled();
  });
});

describe('SignIn phone confirmation and recovery with channels', () => {
  const verifying = (channels?: PhoneOtpChannel[]): Partial<ProjectSettings> => ({
    emailAuthEnabled: false,
    phoneAuthEnabled: true,
    phoneOtpRequired: true,
    phoneOtpChannels: channels,
  });

  const submitSignUp = async () => {
    await enterPhone();
    await userEvent.type(screen.getByLabelText(/^New password/), 'secret-pass');
    await userEvent.type(screen.getByLabelText(/^Confirm Password/), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
  };

  it('lets a sign-up pick where the confirmation code goes', async () => {
    const sendPhoneOtp = codeSent('telegram');
    const verifyPhoneOtp = vi.fn(async () => ({ verified: true, otpToken: 'otp-t', expiresInSeconds: 600 }));
    const signUp = vi.fn(async () => session);
    renderWithSaaS(<SignIn initialMode="signUp" />, {
      auth: { sendPhoneOtp, verifyPhoneOtp, signUp },
      settings: verifying(['sms', 'telegram']),
    });

    await submitSignUp();
    expect(screen.getByText(`How should we send the code to ${PHONE}?`)).toBeInTheDocument();
    expect(sendPhoneOtp).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Get code via Telegram' }));

    expect(sendPhoneOtp).toHaveBeenCalledWith(PHONE, 'register', expect.objectContaining({ channel: 'telegram' }));
    expect(await screen.findByRole('button', { name: 'Get the code another way' })).toBeInTheDocument();
    await enterCode('Verification Code', '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm and sign up' }));

    expect(verifyPhoneOtp).toHaveBeenCalledWith(PHONE, '123456', 'register');
    expect(signUp).toHaveBeenCalledWith(
      PHONE,
      'secret-pass',
      expect.objectContaining({ otpToken: 'otp-t', kind: 'phone' }),
      undefined,
    );
  });

  it('sends through the only channel without asking', async () => {
    const sendPhoneOtp = codeSent('whatsapp');
    renderWithSaaS(<SignIn initialMode="signUp" />, { auth: { sendPhoneOtp }, settings: verifying(['whatsapp']) });

    await submitSignUp();

    expect(sendPhoneOtp).toHaveBeenCalledWith(PHONE, 'register', expect.objectContaining({ channel: 'whatsapp' }));
    expect(await screen.findByText(`We sent a code to ${PHONE} in WhatsApp`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get the code another way' })).not.toBeInTheDocument();
  });

  it('offers the channels for a password reset by phone', async () => {
    const sendPhoneOtp = codeSent('sms');
    renderWithSaaS(<SignIn />, { auth: { sendPhoneOtp }, settings: verifying(['sms', 'telegram']) });

    await enterPhone();
    await userEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.queryByRole('button', { name: 'Send code' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Get code via SMS' }));

    expect(sendPhoneOtp).toHaveBeenCalledWith(PHONE, 'reset', expect.objectContaining({ channel: 'sms' }));
    expect(await screen.findByText(`Enter the code sent to ${PHONE} and choose a new password.`)).toBeInTheDocument();
  });

  it('keeps the old flow on a server without channels', async () => {
    const sendPhoneOtp = codeSent();
    renderWithSaaS(<SignIn initialMode="signUp" />, { auth: { sendPhoneOtp }, settings: verifying() });

    await submitSignUp();

    expect(sendPhoneOtp).toHaveBeenCalledWith(PHONE, 'register', expect.anything());
    expect(sendPhoneOtp.mock.calls[0]).not.toContainEqual(expect.objectContaining({ channel: expect.anything() }));
    expect(await screen.findByText(`We sent a 6-digit code to ${PHONE}`)).toBeInTheDocument();
  });

  it('signs in with a password on a server without passwordless sign-in', async () => {
    renderWithSaaS(<SignIn />, { settings: verifying() });

    await enterPhone();

    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get a code instead' })).not.toBeInTheDocument();
  });
});
