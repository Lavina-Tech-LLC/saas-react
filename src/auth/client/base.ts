import type { SaaSEvents } from '../../core/client';
import type { EventEmitter } from '../../core/eventEmitter';
import type { TokenManager } from '../../core/tokenManager';
import type { Transport } from '../../core/transport';
import type { AuthResult, ProjectSettings, SignInResult, SignUpResult, User } from '../types';

/** Shared state and session plumbing for the auth client layers. */
export class AuthClientBase {
  protected transport: Transport;
  protected tokenManager: TokenManager | null;
  protected emitter: EventEmitter<SaaSEvents>;
  protected baseUrl: string;
  protected cachedUser: User | null = null;
  protected cachedSettings: ProjectSettings | null = null;

  constructor(
    transport: Transport,
    tokenManager: TokenManager | null,
    emitter: EventEmitter<SaaSEvents>,
    baseUrl: string,
  ) {
    this.transport = transport;
    this.tokenManager = tokenManager;
    this.emitter = emitter;
    this.baseUrl = baseUrl;
  }

  async getToken(): Promise<string | null> {
    const token = this.tokenManager?.getAccessToken() ?? null;
    if (token) return token;

    if (this.tokenManager?.hasRefreshToken()) {
      try {
        await this.tokenManager.refreshOnce();
        return this.tokenManager?.getAccessToken() ?? null;
      } catch {
        this.clearSession();
        return null;
      }
    }
    return null;
  }

  async refreshUser(): Promise<User | null> {
    const token = await this.getToken();
    if (!token) return this.cachedUser;

    try {
      this.cachedUser = await this.transport.get<User>('/auth/me', { Authorization: `Bearer ${token}` });
      this.emitter.emit('authStateChange', this.cachedUser);
      return this.cachedUser;
    } catch {
      return this.cachedUser;
    }
  }

  /**
   * Stores the session unless the response is a second-factor challenge, in
   * which case it is handed back untouched for the caller to resolve.
   */
  protected completeAuthStep(result: AuthResult): AuthResult {
    if ('mfaRequired' in result && result.mfaRequired) return result;
    if ('faceRequired' in result && result.faceRequired) return result;

    const signIn = result as SignInResult;
    this.setSession(signIn);
    return signIn;
  }

  protected setSession(result: SignInResult | SignUpResult): void {
    this.tokenManager?.setTokens(result.accessToken, result.refreshToken);
    this.cachedUser = result.user;
    this.emitter.emit('authStateChange', result.user);

    // Fetch fresh profile from /me in background to ensure complete data
    // (avatar, name, etc. that may differ from the login/register response).
    this.refreshUser();
  }

  protected clearSession(): void {
    this.tokenManager?.clearTokens();
    this.cachedUser = null;
    this.emitter.emit('authStateChange', null);
  }

  protected authHeaders(): Record<string, string> {
    const token = this.tokenManager?.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
