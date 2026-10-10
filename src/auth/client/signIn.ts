import { identifierPayload, type IdentifierKind } from '../identifier';
import type {
  AuthResult,
  FaceRequiredResult,
  OAuthProvider,
  PhoneOtpPurpose,
  PhoneOtpSendResult,
  PhoneOtpVerifyResult,
  SignUpOptions,
  SignUpResult,
} from '../types';
import { openOAuthPopup } from './oauthPopup';
import { SessionClient } from './session';

/** Every way of starting a session: password, sign-up, OAuth, magic link — plus password recovery. */
export class SignInClient extends SessionClient {
  /**
   * Signs in with an e-mail address or a phone number, depending on what the
   * project accepts. Pass `kind` when the form already knows which one the user
   * entered; otherwise the identifier is classified by shape.
   */
  async signIn(identifier: string, password: string, kind?: IdentifierKind): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/login', {
      ...identifierPayload(identifier, kind),
      password,
    });
    return this.completeAuthStep(result);
  }

  /**
   * Registers with an e-mail address or a phone number.
   *
   * `inviteCode` attaches the new user to the inviting organization instead of
   * creating one, and works even when self-service registration is switched off.
   * `otpToken` proves ownership of a phone number and is only needed when
   * `settings.phoneOtpRequired` is true.
   *
   * `faceChallenge` makes a project that requires face control answer with a
   * face challenge instead of a session — check with `isFaceRequired`.
   *
   * The third argument also accepts a bare invite code for backwards
   * compatibility with releases before phone sign-up.
   */
  async signUp(
    identifier: string,
    password: string,
    options: SignUpOptions & { faceChallenge: true },
  ): Promise<SignUpResult | FaceRequiredResult>;
  async signUp(
    identifier: string,
    password: string,
    optionsOrInviteCode?: SignUpOptions | string,
    kind?: IdentifierKind,
  ): Promise<SignUpResult>;
  async signUp(
    identifier: string,
    password: string,
    optionsOrInviteCode?: SignUpOptions | string,
    kind?: IdentifierKind,
  ): Promise<SignUpResult | FaceRequiredResult> {
    const options: SignUpOptions =
      typeof optionsOrInviteCode === 'string'
        ? { inviteCode: optionsOrInviteCode, kind }
        : { kind, ...optionsOrInviteCode };

    const body: Record<string, string | boolean> = {
      ...identifierPayload(identifier, options.kind),
      password,
    };
    if (options.inviteCode) body.inviteCode = options.inviteCode;
    if (options.otpToken) body.otpToken = options.otpToken;
    if (options.faceChallenge) body.faceChallenge = true;

    const result = await this.transport.post<SignUpResult | FaceRequiredResult>('/auth/register', body);
    // A face challenge carries no session yet: it comes with the enrollment.
    if ('faceRequired' in result) return result;
    this.setSession(result);
    return result;
  }

  /**
   * Completes the TOTP step. When the project also uses face control the result
   * is a face challenge rather than a session — check with `isFaceRequired`.
   */
  async submitMfaCode(mfaToken: string, code: string): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/login/mfa', { mfaToken, code });
    return this.completeAuthStep(result);
  }

  /**
   * Opens the provider's consent popup and exchanges the returned code for a
   * session. Pass `inviteCode` when the user arrived from an invite landing
   * page: it keeps an OAuth sign-up on the invite path, so the backend attaches
   * the invited membership instead of creating a personal organization.
   */
  async signInWithOAuth(provider: OAuthProvider, inviteCode?: string): Promise<AuthResult> {
    const popupCallbackUrl = `${this.baseUrl}/auth/oauth/${provider}/popup-callback`;

    const { authUrl, state } = await this.transport.get<{ authUrl: string; state: string }>(
      `/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(popupCallbackUrl)}`,
    );

    const result = await openOAuthPopup(authUrl, (data) =>
      this.transport.post<AuthResult>(`/auth/oauth/${provider}/callback`, {
        code: data.code,
        state: data.state || state,
        inviteCode,
      }),
    );
    // A project with face control answers with a challenge rather than a
    // session, so the result goes through the same gate as password login.
    return this.completeAuthStep(result);
  }

  // ---------------------------------------------------------------------------
  // Phone verification (SMS one-time codes)
  // ---------------------------------------------------------------------------

  /**
   * Sends a one-time code to a phone number. Rejects with a 409 when the
   * project has no SMS provider configured — callers should treat that as
   * "verification unavailable", not as a failure to sign up.
   */
  async sendPhoneOtp(phone: string, purpose: PhoneOtpPurpose = 'register'): Promise<PhoneOtpSendResult> {
    return this.transport.post<PhoneOtpSendResult>('/auth/phone/otp/send', { phone, purpose });
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

  // ---------------------------------------------------------------------------
  // Magic link & password reset
  // ---------------------------------------------------------------------------

  async sendMagicLink(email: string, redirectUrl: string): Promise<void> {
    await this.transport.post('/auth/magic-link/send', { email, redirectUrl });
  }

  /**
   * Redeems a magic link. Like password sign-in, this can come back as a face
   * challenge instead of a session — check with `isFaceRequired`.
   */
  async verifyMagicLink(token: string): Promise<AuthResult> {
    const result = await this.transport.post<AuthResult>('/auth/magic-link/verify', { token });
    return this.completeAuthStep(result);
  }

  async sendPasswordReset(email: string, redirectUrl: string): Promise<void> {
    await this.transport.post('/auth/password-reset/send', { email, redirectUrl });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/password-reset/verify', { token, newPassword });
  }
}
