import type { AuthStateCallback, ProjectSettings, User } from '../types';
import { AuthClientBase } from './base';

/** Lifecycle, the cached user and settings, and session teardown. */
export class SessionClient extends AuthClientBase {
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = this.doLoad().finally(() => {
      this.loadPromise = null;
    });
    return this.loadPromise;
  }

  private async doLoad(): Promise<void> {
    try {
      this.cachedSettings = await this.transport.get<ProjectSettings>('/auth/settings');
    } catch (e) {
      console.warn('[SaaS Support] Failed to load project settings:', e);
    }

    if (this.tokenManager?.hasRefreshToken()) {
      try {
        await this.tokenManager.refreshOnce();
      } catch {
        this.tokenManager?.clearTokens();
      }
    }

    this.loaded = true;
  }

  async getUser(): Promise<User | null> {
    if (this.cachedUser) return this.cachedUser;

    const token = await this.getToken();
    if (!token) return null;

    try {
      this.cachedUser = await this.transport.get<User>('/auth/me', { Authorization: `Bearer ${token}` });
      return this.cachedUser;
    } catch {
      return null;
    }
  }

  getUserSync(): User | null {
    return this.cachedUser;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async getSettings(): Promise<ProjectSettings | null> {
    if (this.cachedSettings) return this.cachedSettings;
    try {
      this.cachedSettings = await this.transport.get<ProjectSettings>('/auth/settings');
      return this.cachedSettings;
    } catch {
      return null;
    }
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    return this.emitter.on('authStateChange', callback);
  }

  async signOut(): Promise<void> {
    const refreshToken = this.tokenManager?.getRefreshToken();
    if (refreshToken) {
      try {
        await this.transport.post('/auth/logout', { refreshToken });
      } catch {
        // Best-effort logout.
      }
    }
    this.clearSession();
  }

  async deleteAccount(): Promise<void> {
    await this.transport.del('/auth/account', this.authHeaders());
    this.clearSession();
  }

  /** @internal Called when another tab logs out (via storage event). */
  handleExternalLogout(): void {
    this.cachedUser = null;
    this.emitter.emit('authStateChange', null);
  }

  /** @internal */
  async performRefresh(): Promise<void> {
    const refreshToken = this.tokenManager?.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const result = await this.transport.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });

    this.tokenManager!.setTokens(result.accessToken, result.refreshToken);

    if (!this.cachedUser) {
      try {
        this.cachedUser = await this.transport.get<User>('/auth/me', { Authorization: `Bearer ${result.accessToken}` });
        this.emitter.emit('authStateChange', this.cachedUser);
      } catch {
        // User fetch failed; continue without cached user.
      }
    }
  }
}
