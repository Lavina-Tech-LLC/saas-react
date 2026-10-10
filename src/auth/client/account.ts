import type {
  FaceEnrollResult,
  FaceSample,
  FaceStatus,
  MfaSetupResult,
  MfaVerifyResult,
  SignInResult,
  User,
} from '../types';
import { SignInClient } from './signIn';

/** The signed-in user's own account: face control, MFA and profile. */
export class AccountClient extends SignInClient {
  // ---------------------------------------------------------------------------
  // Face control
  // ---------------------------------------------------------------------------

  /**
   * Stores the user's face template.
   *
   * Pass `faceToken` from a `faceRequired` login response to enroll during
   * sign-in — that also completes the sign-in and starts the session. Without a
   * token the call enrolls (or re-scans) the already signed-in user.
   *
   * `consent` is mandatory: face data is only stored on an explicit opt-in.
   */
  async enrollFace(
    samples: FaceSample[],
    options: { faceToken?: string; model?: string } = {},
  ): Promise<FaceEnrollResult> {
    const result = await this.transport.post<FaceEnrollResult>(
      '/auth/face/enroll',
      {
        samples,
        consent: true,
        model: options.model ?? 'face-api/128',
        faceToken: options.faceToken,
      },
      options.faceToken ? undefined : this.authHeaders(),
    );

    if (result.accessToken && result.refreshToken && result.user) {
      this.setSession(result as unknown as SignInResult);
    }
    return result;
  }

  /** Finishes a sign-in by matching a live face against the stored template. */
  async verifyFace(faceToken: string, descriptor: number[]): Promise<SignInResult> {
    const result = await this.transport.post<SignInResult>('/auth/face/verify', {
      faceToken,
      descriptor,
    });
    this.setSession(result);
    return result;
  }

  async getFaceStatus(): Promise<FaceStatus> {
    return this.transport.get<FaceStatus>('/auth/face/status', this.authHeaders());
  }

  /** Removes the user's face template so they can scan again. */
  async deleteFace(): Promise<void> {
    await this.transport.del('/auth/face', this.authHeaders());
  }

  // ---------------------------------------------------------------------------
  // MFA management
  // ---------------------------------------------------------------------------

  async setupMfa(): Promise<MfaSetupResult> {
    return this.transport.post<MfaSetupResult>('/auth/mfa/setup', undefined, this.authHeaders());
  }

  async verifyMfa(code: string): Promise<MfaVerifyResult> {
    return this.transport.post<MfaVerifyResult>('/auth/mfa/verify', { code }, this.authHeaders());
  }

  async disableMfa(code: string): Promise<void> {
    await this.transport.post('/auth/mfa/disable', { code }, this.authHeaders());
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  async updateProfile(params: {
    name?: string;
    avatarUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<User> {
    const user = await this.transport.patch<User>('/auth/me', params, this.authHeaders());
    this.cachedUser = user;
    this.emitter.emit('authStateChange', user);
    return user;
  }

  async uploadAvatar(imageBlob: Blob): Promise<{ avatarUrl: string; small: string; medium: string; original: string }> {
    const result = await this.transport.uploadBinary<{
      avatarUrl: string;
      small: string;
      medium: string;
      original: string;
    }>('/auth/avatar', imageBlob, this.authHeaders());

    if (this.cachedUser) {
      this.cachedUser = { ...this.cachedUser, avatarUrl: result.avatarUrl };
      this.emitter.emit('authStateChange', this.cachedUser);
    }

    return result;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.transport.post('/auth/change-password', { currentPassword, newPassword }, this.authHeaders());
  }
}
