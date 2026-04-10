import { Transport } from './transport'
import { TokenManager } from './tokenManager'
import { EventEmitter } from './eventEmitter'
import { AuthClient } from '../auth/client'
import type { SaaSOptions } from './types'
import type { User } from '../auth/types'
import type { SaaSError } from './error'

const DEFAULT_BASE_URL = 'https://api.saas-support.com/v1'

export interface SaaSEvents {
  authStateChange: User | null
  error: SaaSError
}

export class SaaSSupport {
  readonly auth: AuthClient
  readonly baseUrl: string

  private tokenManager: TokenManager | null = null
  private emitter: EventEmitter<SaaSEvents>
  private loaded = false
  private loadPromise: Promise<void> | null = null

  constructor(options: SaaSOptions) {
    if (!options.publishableKey && !options.apiKey) {
      throw new Error('SaaSSupport: either publishableKey or apiKey is required')
    }

    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
    this.baseUrl = baseUrl
    this.emitter = new EventEmitter()

    const authTransport = options.publishableKey
      ? new Transport(baseUrl, { type: 'publishableKey', key: options.publishableKey })
      : null

    const moduleTransport = options.apiKey
      ? new Transport(baseUrl, { type: 'apiKey', key: options.apiKey })
      : null

    if (options.publishableKey) {
      this.tokenManager = new TokenManager(options.publishableKey)
    }

    this.auth = new AuthClient(
      authTransport ?? moduleTransport!,
      this.tokenManager,
      this.emitter,
      baseUrl,
    )

    if (this.tokenManager) {
      this.tokenManager.setRefreshCallback(() => this.auth.performRefresh())
      this.tokenManager.setTokensChangedCallback(() => {
        if (!this.tokenManager!.hasRefreshToken()) {
          this.auth.handleExternalLogout()
        }
      })
    }

    if (this.tokenManager && authTransport) {
      authTransport.setUnauthorizedHandler(async () => {
        try {
          await this.tokenManager!.refreshOnce()
          return this.tokenManager!.getAccessToken()
        } catch {
          return null
        }
      })
    }
  }

  async load(): Promise<void> {
    if (this.loaded) return
    if (this.loadPromise) return this.loadPromise
    this.loadPromise = this.auth.load()
      .then(() => { this.loaded = true })
      .finally(() => { this.loadPromise = null })
    return this.loadPromise
  }

  isLoaded(): boolean {
    return this.loaded
  }

  onError(callback: (error: SaaSError) => void): () => void {
    return this.emitter.on('error', callback)
  }

  destroy(): void {
    this.tokenManager?.destroy()
    this.emitter.removeAll()
  }
}
