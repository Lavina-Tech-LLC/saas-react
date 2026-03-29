export class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private refreshInFlight: Promise<void> | null = null
  private storageKey: string
  private onRefreshNeeded: (() => Promise<void>) | null = null
  private onTokensChanged: (() => void) | null = null
  private boundHandleStorage: ((e: StorageEvent) => void) | null = null

  constructor(keyPrefix: string) {
    this.storageKey = `ss_rt_${keyPrefix.slice(0, 12)}`
    this.refreshToken = this.loadRefreshToken()

    if (typeof window !== 'undefined') {
      this.boundHandleStorage = this.handleStorageEvent.bind(this)
      window.addEventListener('storage', this.boundHandleStorage)
    }
  }

  setRefreshCallback(cb: () => Promise<void>): void {
    this.onRefreshNeeded = cb
  }

  setTokensChangedCallback(cb: () => void): void {
    this.onTokensChanged = cb
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  hasRefreshToken(): boolean {
    return this.refreshToken !== null
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.saveRefreshToken(refreshToken)
    this.scheduleRefresh(accessToken)
  }

  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.removeRefreshToken()
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Coalesces concurrent refresh calls within this tab and coordinates
   * across tabs via Web Locks API (when available).
   */
  async refreshOnce(): Promise<void> {
    if (this.refreshInFlight) {
      return this.refreshInFlight
    }

    this.refreshInFlight = this.executeRefresh().finally(() => {
      this.refreshInFlight = null
    })

    return this.refreshInFlight
  }

  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    if (typeof window !== 'undefined' && this.boundHandleStorage) {
      window.removeEventListener('storage', this.boundHandleStorage)
      this.boundHandleStorage = null
    }
  }

  private async executeRefresh(): Promise<void> {
    if (!this.onRefreshNeeded) {
      throw new Error('No refresh callback configured')
    }

    if (typeof navigator !== 'undefined' && 'locks' in navigator) {
      await navigator.locks.request(
        `ss_refresh_lock_${this.storageKey}`,
        async () => {
          // Another tab may have refreshed while we waited for the lock.
          // Adopt the latest RT from localStorage if it changed.
          const storedRT = this.loadRefreshToken()
          if (storedRT && storedRT !== this.refreshToken) {
            this.refreshToken = storedRT
          }
          await this.onRefreshNeeded!()
        },
      )
    } else {
      await this.onRefreshNeeded()
    }
  }

  private scheduleRefresh(accessToken: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    const exp = this.getTokenExpiry(accessToken)
    if (!exp) return

    const msUntilRefresh = exp * 1000 - Date.now() - 60_000
    if (msUntilRefresh <= 0) {
      this.refreshOnce().catch(() => {})
      return
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshOnce().catch(() => {})
    }, msUntilRefresh)
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key !== this.storageKey) return

    if (event.newValue === null) {
      // Another tab logged out.
      this.accessToken = null
      this.refreshToken = null
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }
      this.onTokensChanged?.()
      return
    }

    if (event.newValue !== this.refreshToken) {
      // Another tab refreshed. Adopt the new RT, clear stale AT.
      this.refreshToken = event.newValue
      this.accessToken = null
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }
    }
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded.exp ?? null
    } catch {
      return null
    }
  }

  private loadRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey)
    } catch {
      return null
    }
  }

  private saveRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.storageKey, token)
    } catch {
      // localStorage might not be available (SSR, privacy mode).
    }
  }

  private removeRefreshToken(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch {
      // Ignore.
    }
  }
}
