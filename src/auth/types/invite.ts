export interface Invite {
  inviteId: string;
  /** Empty when the invite was addressed to a phone number. */
  email: string;
  /** Empty when the invite was addressed to an e-mail. */
  phone?: string;
  role: string;
  roleId?: string;
  token: string;
  /** Canonical shareable invite URL, built by the backend from AuthSettings.InviteLinkBaseURL. */
  url?: string;
  expiresAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  phone?: string;
  role: string;
  roleId?: string;
  roleName?: string;
  expiresAt: string;
  createdAt: string;
}

export interface MyPendingInvite {
  id: string;
  phone?: string;
  orgId: string;
  orgName: string;
  role: string;
  roleId?: string;
  roleName?: string;
  expiresAt: string;
  createdAt: string;
}

export interface InviteLink {
  id: string;
  code: string;
  /** Canonical shareable invite URL, built by the backend from AuthSettings.InviteLinkBaseURL. */
  url?: string;
  role: string;
  roleId?: string;
  roleName?: string;
  maxUses: number;
  useCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface InviteLinkInfo {
  orgName: string;
  orgAvatarUrl?: string;
  role: string;
  roleName?: string;
  expiresAt: string;
}

/**
 * Unified invite info returned by GET /auth/invites/info/:code. The `code`
 * may be either a per-email AuthInvite raw token or a reusable AuthInviteLink
 * code — the backend transparently resolves which. `type` discriminates the
 * two so the UI can, e.g., pre-fill the email field for per-email invites.
 */
export interface InviteInfo {
  type: 'email' | 'link';
  orgId: string;
  orgName: string;
  orgAvatarUrl?: string;
  role: string;
  roleName?: string;
  inviterName?: string;
  inviterEmail?: string;
  inviterAvatarUrl?: string;
  /** Only populated when `type === 'email'`. */
  targetEmail?: string;
  /** Set when the invite was addressed to a phone number. */
  targetPhone?: string;
  expiresAt: string;
}

export interface UseInviteLinkResult {
  orgId: string;
  orgName: string;
  role: string;
  roleId?: string;
}

export interface AcceptInviteByCodeResult {
  orgId: string;
  orgName: string;
  role: string;
  roleId?: string;
}
