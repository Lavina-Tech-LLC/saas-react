import { identifierPayload, type IdentifierKind } from '../identifier';
import type {
  AcceptInviteByCodeResult,
  ApiKey,
  CreateApiKeyInput,
  CreatedApiKey,
  Invite,
  InviteInfo,
  InviteLink,
  InviteLinkInfo,
  MyPendingInvite,
  PendingInvite,
  UseInviteLinkResult,
} from '../types';
import { OrgClient } from './orgs';

/** The full auth client: everything above plus invites, invite links and API keys. */
export class AuthClient extends OrgClient {
  // ---------------------------------------------------------------------------
  // Invites
  // ---------------------------------------------------------------------------

  /**
   * Invites somebody to an organization by e-mail or phone number, whichever
   * the project accepts. Nothing is delivered: the response carries the link,
   * which the inviter passes on however they like.
   *
   * Re-inviting the same person replaces their pending invite with a fresh
   * link — the previous token is not recoverable.
   */
  async sendInvite(
    orgId: string,
    identifier: string,
    role?: string,
    roleId?: string,
    kind?: IdentifierKind,
  ): Promise<Invite> {
    return this.transport.post<Invite>(
      `/auth/orgs/${orgId}/invites`,
      { ...identifierPayload(identifier, kind), role, roleId },
      this.authHeaders(),
    );
  }

  async acceptInvite(token: string): Promise<{ orgId: string; role: string }> {
    return this.transport.post<{ orgId: string; role: string }>(
      `/auth/invites/${token}/accept`,
      undefined,
      this.authHeaders(),
    );
  }

  async listInvites(orgId: string): Promise<PendingInvite[]> {
    return this.transport.get<PendingInvite[]>(`/auth/orgs/${orgId}/invites`, this.authHeaders());
  }

  async revokeInvite(orgId: string, inviteId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/invites/${inviteId}`, this.authHeaders());
  }

  async listMyInvites(): Promise<MyPendingInvite[]> {
    return this.transport.get<MyPendingInvite[]>('/auth/invites/pending', this.authHeaders());
  }

  async acceptInviteById(inviteId: string): Promise<{ orgId: string; role: string }> {
    return this.transport.post<{ orgId: string; role: string }>(
      `/auth/invites/${inviteId}/accept-by-id`,
      undefined,
      this.authHeaders(),
    );
  }

  async declineInvite(inviteId: string): Promise<void> {
    await this.transport.del(`/auth/invites/${inviteId}/decline`, this.authHeaders());
  }

  // ---------------------------------------------------------------------------
  // Invite Links
  // ---------------------------------------------------------------------------

  async createInviteLink(orgId: string, role?: string, roleId?: string, maxUses?: number): Promise<InviteLink> {
    return this.transport.post<InviteLink>(
      `/auth/orgs/${orgId}/invite-links`,
      { role, roleId, maxUses: maxUses ?? 0 },
      this.authHeaders(),
    );
  }

  async listInviteLinks(orgId: string): Promise<InviteLink[]> {
    return this.transport.get<InviteLink[]>(`/auth/orgs/${orgId}/invite-links`, this.authHeaders());
  }

  async revokeInviteLink(orgId: string, linkId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/invite-links/${linkId}`, this.authHeaders());
  }

  async getInviteLinkInfo(code: string): Promise<InviteLinkInfo> {
    return this.transport.get<InviteLinkInfo>(`/auth/invite-links/${code}/info`);
  }

  async useInviteLink(code: string): Promise<UseInviteLinkResult> {
    return this.transport.post<UseInviteLinkResult>(`/auth/invite-links/${code}/use`, undefined, this.authHeaders());
  }

  /**
   * Fetch public info about an invite by code. Works for both per-email
   * AuthInvite raw tokens and reusable AuthInviteLink codes. Unauthenticated.
   */
  async getInviteInfo(code: string): Promise<InviteInfo> {
    return this.transport.get<InviteInfo>(`/auth/invites/info/${encodeURIComponent(code)}`);
  }

  /**
   * Accept an invite by code (per-email token OR reusable link code) for the
   * authenticated user. Creates the membership atomically.
   */
  async acceptInviteByCode(code: string): Promise<AcceptInviteByCodeResult> {
    return this.transport.post<AcceptInviteByCodeResult>(
      `/auth/invites/code/${encodeURIComponent(code)}/accept`,
      undefined,
      this.authHeaders(),
    );
  }

  // ---------------------------------------------------------------------------
  // API Keys (end-user programmatic credentials, scoped to one org membership)
  // ---------------------------------------------------------------------------

  async listApiKeys(orgId: string): Promise<ApiKey[]> {
    return this.transport.get<ApiKey[]>(`/auth/orgs/${orgId}/api-keys`, this.authHeaders());
  }

  async createApiKey(orgId: string, input: CreateApiKeyInput): Promise<CreatedApiKey> {
    return this.transport.post<CreatedApiKey>(`/auth/orgs/${orgId}/api-keys`, input, this.authHeaders());
  }

  async revokeApiKey(orgId: string, keyId: string): Promise<void> {
    await this.transport.del(`/auth/orgs/${orgId}/api-keys/${keyId}`, this.authHeaders());
  }
}
