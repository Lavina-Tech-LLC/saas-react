/** First letter of the user's name, email or phone — avatar fallback. */
export function userInitial(user: { name?: string; email?: string; phone?: string } | null | undefined): string {
  return (user?.name || user?.email || user?.phone || '?').charAt(0).toUpperCase();
}

/** Up to two initials of an organization name ("Acme Corp" → "AC"). */
export function orgInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
