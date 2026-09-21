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
 * The backend builds the URL from the project's "Invite Link Base URL". When
 * that setting is empty it can only return a relative `?invite_code=...`, which
 * is useless on its own — so it is resolved against the current page. That
 * fallback is a guess: the page an administrator happens to be on is rarely the
 * page an invitee should land on, which is why the base URL is worth setting.
 */
export function resolveInviteUrl(invite: { code?: string; url?: string }): string {
  if (invite.url) {
    if (invite.url.startsWith('http://') || invite.url.startsWith('https://')) {
      return invite.url
    }
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname + invite.url
    }
    return invite.url
  }
  if (typeof window === 'undefined' || !invite.code) return ''
  return `${window.location.origin}/?invite_code=${invite.code}`
}
