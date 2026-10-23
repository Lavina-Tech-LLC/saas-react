import type {
  PhoneOtpPurpose,
  PhoneOtpSendOptions,
  PhoneOtpSendResult,
  PhoneOtpVerifyResult,
  PhoneSignInOptions,
  PhoneSignInResult,
} from '../types';
import { SignInClient } from './signIn';

/** One-time codes sent to a phone number (SMS, Telegram, WhatsApp): verification, recovery and passwordless sign-in. */
export class PhoneClient extends SignInClient {
  /**
   * Sends a one-time code to a phone number. Rejects with a 409 when the
   * project has no delivery channel at all — callers should treat that as
   * "verification unavailable", not as a failure to sign up. A 422 means the
   * number is not on the requested messenger and a 503 that the channel is
   * down for now: offer another one from `settings.phoneOtpChannels`.
   */
  async sendPhoneOtp(
    phone: string,
    purpose: PhoneOtpPurpose = 'register',
    options: PhoneOtpSendOptions = {},
  ): Promise<PhoneOtpSendResult> {
    const body: Record<string, string> = { phone, purpose };
    if (options.channel) body.channel = options.channel;
    if (options.locale) body.locale = options.locale;
    if (options.inviteCode) body.inviteCode = options.inviteCode;
    return this.transport.post<PhoneOtpSendResult>('/auth/phone/otp/send', body);
  }

  /** Exchanges a delivered code for a short-lived proof-of-ownership token. */
  async verifyPhoneOtp(
    phone: string,
    code: string,
    purpose: PhoneOtpPurpose = 'register',
  ): Promise<PhoneOtpVerifyResult> {
    return this.transport.post<PhoneOtpVerifyResult>('/auth/phone/otp/verify', { phone, code, purpose });
  }

  /** Sets a new password for a phone account, authorized by a "reset" OTP token. */
  async resetPasswordByPhone(phone: string, otpToken: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/password-reset/phone', { phone, otpToken, newPassword });
  }

  /**
   * Signs in with a phone number and a `login` code from `sendPhoneOtp` — no
   * password. A number without an account gets one when the project allows
   * it; the result then carries `isNewUser`. Like password sign-in, the answer
   * can be an MFA or face challenge instead of a session — check with
   * `isMfaRequired` / `isFaceRequired`.
   */
  async signInWithPhoneCode(phone: string, code: string, options: PhoneSignInOptions = {}): Promise<PhoneSignInResult> {
    const body: Record<string, string | boolean> = { phone, code };
    if (options.inviteCode) body.inviteCode = options.inviteCode;
    if (options.faceChallenge) body.faceChallenge = true;

    const result = await this.transport.post<PhoneSignInResult>('/auth/phone/login', body);
    this.completeAuthStep(result);
    return result;
  }
}
