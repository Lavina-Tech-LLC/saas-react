import { SaaSError } from './error'

export type AuthMode =
  | { type: 'publishableKey'; key: string }
  | { type: 'apiKey'; key: string }
  | { type: 'portalToken'; token: string }
  | { type: 'embedToken'; token: string }

export class Transport {
  private baseUrl: string
  private authMode: AuthMode
  private onUnauthorized: (() => Promise<string | null>) | null = null

  constructor(baseUrl: string, authMode: AuthMode) {
    this.baseUrl = baseUrl
    this.authMode = authMode
  }

  /** Register a handler that refreshes tokens and returns a new access token, or null. */
  setUnauthorizedHandler(handler: () => Promise<string | null>): void {
    this.onUnauthorized = handler
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      return await this.doRequest<T>(method, path, body, headers)
    } catch (err) {
      if (
        err instanceof SaaSError &&
        err.isUnauthorized &&
        this.onUnauthorized &&
        headers?.['Authorization']
      ) {
        const newToken = await this.onUnauthorized()
        if (newToken) {
          return this.doRequest<T>(method, path, body, {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          })
        }
      }
      throw err
    }
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, headers)
  }

  async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, body, headers)
  }

  async patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, body, headers)
  }

  async del<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, headers)
  }

  async uploadBinary<T>(
    path: string,
    data: Blob,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      return await this.doUploadBinary<T>(path, data, headers)
    } catch (err) {
      if (
        err instanceof SaaSError &&
        err.isUnauthorized &&
        this.onUnauthorized &&
        headers?.['Authorization']
      ) {
        const newToken = await this.onUnauthorized()
        if (newToken) {
          return this.doUploadBinary<T>(path, data, {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          })
        }
      }
      throw err
    }
  }

  private async doUploadBinary<T>(
    path: string,
    data: Blob,
    headers?: Record<string, string>,
  ): Promise<T> {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      ...this.getAuthHeaders(),
      ...headers,
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: reqHeaders,
      body: data,
    })

    const json = await res.json()

    if (json.code && json.code >= 400) {
      const domain = this.inferDomain(path)
      throw new SaaSError(json.code, json.message || 'Upload failed', domain)
    }

    return json.data as T
  }

  private async doRequest<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...headers,
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    const json = await res.json()

    if (json.code && json.code >= 400) {
      const domain = this.inferDomain(path)
      throw new SaaSError(json.code, json.message || 'Request failed', domain)
    }

    return json.data as T
  }

  private getAuthHeaders(): Record<string, string> {
    switch (this.authMode.type) {
      case 'publishableKey':
      case 'apiKey':
        return { 'X-API-Key': this.authMode.key }
      case 'portalToken':
      case 'embedToken':
        return { 'Authorization': `Bearer ${this.authMode.token}` }
    }
  }

  private inferDomain(path: string): 'auth' | 'billing' | 'report' | 'unknown' {
    if (path.startsWith('/auth')) return 'auth'
    if (path.startsWith('/billing')) return 'billing'
    if (path.startsWith('/report')) return 'report'
    return 'unknown'
  }
}
