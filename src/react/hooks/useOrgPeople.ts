import { useCallback, useState } from 'react';

import { resolveInviteUrl, type IdentifierKind } from '../../auth/identifier';
import type { InviteLink, Member, Org, PendingInvite } from '../../auth/types';
import type { SaaSSupport } from '../../core/client';
import { errorMessage } from './errorMessage';

// Members, pending invites and invite links of the selected organization. Internal to useOrg.
export function useOrgPeople(client: SaaSSupport, setError: (error: string | null) => void) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);

  /** Members are only readable by owners and admins. */
  const loadMembersFor = useCallback(
    async (org: Org) => {
      if (org.role === 'owner' || org.role === 'admin') setMembers(await client.auth.listMembers(org.id));
      else setMembers([]);
    },
    [client],
  );

  const clear = useCallback(() => {
    setMembers([]);
    setInvites([]);
  }, []);

  const sendInvite = useCallback(
    async (orgId: string, identifier: string, role?: string, roleId?: string, kind?: IdentifierKind) => {
      try {
        return await client.auth.sendInvite(orgId, identifier, role, roleId, kind);
      } catch (err) {
        setError(errorMessage(err, 'Failed to send invite'));
        return null;
      }
    },
    [client, setError],
  );

  const refreshInvites = useCallback(
    async (orgId: string) => {
      try {
        setInvites(await client.auth.listInvites(orgId));
      } catch (err) {
        setError(errorMessage(err, 'Failed to load invites'));
      }
    },
    [client, setError],
  );

  const revokeInvite = useCallback(
    async (orgId: string, inviteId: string) => {
      try {
        await client.auth.revokeInvite(orgId, inviteId);
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to revoke invite'));
        return false;
      }
    },
    [client, setError],
  );

  const updateMemberRole = useCallback(
    async (orgId: string, userId: string, role?: string, roleId?: string) => {
      try {
        await client.auth.updateMemberRole(orgId, userId, role, roleId);
        setMembers(await client.auth.listMembers(orgId)); // server holds the accurate role data
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to update member role'));
        return false;
      }
    },
    [client, setError],
  );

  const updateMemberRoles = useCallback(
    async (orgId: string, userId: string, roles: string[]) => {
      try {
        await client.auth.updateMemberRoles(orgId, userId, roles);
        setMembers(await client.auth.listMembers(orgId));
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to update member roles'));
        return false;
      }
    },
    [client, setError],
  );

  const removeMember = useCallback(
    async (orgId: string, userId: string) => {
      try {
        await client.auth.removeMember(orgId, userId);
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to remove member'));
        return false;
      }
    },
    [client, setError],
  );

  const refreshMembers = useCallback(
    async (orgId: string) => {
      try {
        setMembers(await client.auth.listMembers(orgId));
      } catch (err) {
        setError(errorMessage(err, 'Failed to load members'));
      }
    },
    [client, setError],
  );

  const createInviteLink = useCallback(
    async (orgId: string, role?: string, roleId?: string, maxUses?: number) => {
      try {
        const link = await client.auth.createInviteLink(orgId, role, roleId, maxUses);
        setInviteLinks((prev) => [link, ...prev]);
        return link;
      } catch (err) {
        setError(errorMessage(err, 'Failed to create invite link'));
        return null;
      }
    },
    [client, setError],
  );

  const refreshInviteLinks = useCallback(
    async (orgId: string) => {
      try {
        setInviteLinks(await client.auth.listInviteLinks(orgId));
      } catch (err) {
        setError(errorMessage(err, 'Failed to load invite links'));
      }
    },
    [client, setError],
  );

  const revokeInviteLink = useCallback(
    async (orgId: string, linkId: string) => {
      try {
        await client.auth.revokeInviteLink(orgId, linkId);
        setInviteLinks((prev) => prev.filter((l) => l.id !== linkId));
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to revoke invite link'));
        return false;
      }
    },
    [client, setError],
  );

  // Shared with the personal-invite banner so both kinds of invite produce the same absolute link
  const getInviteLinkUrl = useCallback((link: { code?: string; url?: string }) => resolveInviteUrl(link), []);

  return {
    members,
    invites,
    inviteLinks,
    setInviteLinks,
    loadMembersFor,
    clear,
    sendInvite,
    refreshInvites,
    revokeInvite,
    updateMemberRole,
    updateMemberRoles,
    removeMember,
    refreshMembers,
    createInviteLink,
    refreshInviteLinks,
    revokeInviteLink,
    getInviteLinkUrl,
  };
}
