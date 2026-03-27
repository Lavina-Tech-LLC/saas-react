export class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private storageKey: string
  private onRefreshNeeded: (() => Promise<void>) | null = null

  constructor(keyPrefix: string) {
    this.storageKey = `ss_rt_${keyPrefix.slice(0, 12)}`
    this.refreshToken = this.loadRefreshToken()
  }

  setRefreshCallback(cb: () => Promise<void>): void {
    this.onRefreshNeeded = cb
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

  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
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
      this.onRefreshNeeded?.()
      return
    }

    this.refreshTimer = setTimeout(() => {
      this.onRefreshNeeded?.()
    }, msUntilRefresh)
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
