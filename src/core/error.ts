export class SaaSError extends Error {
  code: number
  domain: 'auth' | 'billing' | 'report' | 'unknown'

  constructor(code: number, message: string, domain: 'auth' | 'billing' | 'report' | 'unknown' = 'unknown') {
    super(message)
    this.name = 'SaaSError'
    this.code = code
    this.domain = domain
  }

  get isNotFound(): boolean { return this.code === 404 }
  get isUnauthorized(): boolean { return this.code === 401 }
  get isForbidden(): boolean { return this.code === 403 }
  get isConflict(): boolean { return this.code === 409 }
  get isRateLimited(): boolean { return this.code === 429 }
}
