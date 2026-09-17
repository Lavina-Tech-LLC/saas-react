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
