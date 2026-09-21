/**
 * A project may accept an e-mail address, a phone number, or both as the login
 * identifier. The API takes them in separate fields, so a single "email or
 * phone" input has to be classified before the request is sent.
 */
export type IdentifierKind = 'email' | 'phone'

/**
 * Classifies what the user typed. Only the shape is inspected — a leading plus,
 * or nothing but digits and the usual separators, reads as a phone number.
 * Anything containing "@" is an e-mail.
 */
export function looksLikePhone(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.includes('@')) return false
  if (trimmed.startsWith('+')) return true
  return /^[\d\s\-().]+$/.test(trimmed)
}

/**
 * Builds the identifier half of a login/registration request body. Pass `kind`
 * when the UI already knows which field the user filled in; otherwise the value
 * is classified by shape.
 */
export function identifierPayload(
  identifier: string,
  kind?: IdentifierKind,
): { email: string } | { phone: string } {
  const value = identifier.trim()
  const resolved = kind ?? (looksLikePhone(value) ? 'phone' : 'email')
  return resolved === 'phone' ? { phone: value } : { email: value }
}

/**
 * Turns whatever the API returned for an invite into a link somebody can open.
 *
 * The API builds it from the project's "Invite Link Base URL", which may be
 * written three ways:
 *
 *   - absolute ("https://app.example.com/login") — used as-is, and therefore
 *     pinned to one environment;
 *   - a path ("/login") — resolved against the current origin, so the same
 *     setting produces a production link in production and a localhost link on
 *     a developer machine. This is usually what you want;
 *   - empty — the API can only return a bare `?invite_code=...`, which is
 *     resolved against the current page. That is a guess, and normally a wrong
 *     one: an inviter sits on a dashboard, not on the sign-in route, so the
 *     invitee lands somewhere that never renders the sign-in component.
 */
export function resolveInviteUrl(invite: { code?: string; url?: string }): string {
  const url = invite.url
  if (url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (typeof window === 'undefined') return url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + window.location.pathname + url
  }
  if (typeof window === 'undefined' || !invite.code) return ''
  return `${window.location.origin}/?invite_code=${invite.code}`
}
