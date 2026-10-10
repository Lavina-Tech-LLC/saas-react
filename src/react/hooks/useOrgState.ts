import { useCallback, useEffect, useRef, useState } from 'react';

import type { Org, Role } from '../../auth/types';
import { useSaaSContext } from '../context';
import { errorMessage } from './errorMessage';
import { useOrgPeople } from './useOrgPeople';

const STORAGE_KEY = 'ss_selected_org';
const storage = typeof window !== 'undefined' ? window.localStorage : null;

// The single org state of the app — run once by <SaaSProvider> and read through useOrg().
export function useOrgState() {
  const { client, user, isLoaded } = useSaaSContext();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSelectDone = useRef(false);
  const people = useOrgPeople(client, setError);
  const { loadMembersFor, setInviteLinks, clear: clearPeople } = people;

  const refreshRoles = useCallback(async () => {
    try {
      setRoles(await client.auth.listRoles());
    } catch {
      /* best-effort */
    }
  }, [client]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [list] = await Promise.all([client.auth.listOrgs(), refreshRoles()]);
      setOrgs(list);
      // Keep the selected org in sync with fresh data (e.g. after a rename)
      setSelectedOrg((prev) => (prev ? (list.find((o) => o.id === prev.id) ?? null) : prev));

      if (!initialSelectDone.current && list.length > 0) {
        // Restore the last-used org, else auto-select when there is only one
        const savedId = storage?.getItem(STORAGE_KEY);
        const orgToSelect = list.find((o) => o.id === savedId) ?? (list.length === 1 ? list[0] : null);
        if (orgToSelect) {
          initialSelectDone.current = true;
          setSelectedOrg(orgToSelect);
          storage?.setItem(STORAGE_KEY, orgToSelect.id);
          try {
            await loadMembersFor(orgToSelect);
          } catch {
            /* best-effort */
          }
        }
      }
    } catch (err) {
      setError(errorMessage(err, 'Failed to load organizations'));
    } finally {
      setIsLoading(false);
    }
  }, [client, refreshRoles, loadMembersFor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount: syncing with the server is what effects are for
    if (isLoaded && user) refresh();
  }, [isLoaded, user, refresh]);

  const selectOrg = useCallback(
    async (orgId: string) => {
      try {
        setInviteLinks([]);
        const org = await client.auth.getOrg(orgId);
        setSelectedOrg(org);
        storage?.setItem(STORAGE_KEY, orgId);
        await loadMembersFor(org);
      } catch (err) {
        setError(errorMessage(err, 'Failed to load organization'));
      }
    },
    [client, setInviteLinks, loadMembersFor],
  );

  const createOrg = useCallback(
    async (name: string, slug: string) => {
      try {
        const org = await client.auth.createOrg(name, slug);
        setOrgs((prev) => [...prev, org]);
        return org;
      } catch (err) {
        setError(errorMessage(err, 'Failed to create organization'));
        return null;
      }
    },
    [client],
  );

  const updateOrg = useCallback(
    async (orgId: string, params: { name?: string; avatarUrl?: string }) => {
      try {
        const updated = await client.auth.updateOrg(orgId, params);
        setOrgs((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
        if (selectedOrg?.id === orgId) setSelectedOrg(updated);
        return updated;
      } catch (err) {
        setError(errorMessage(err, 'Failed to update organization'));
        return null;
      }
    },
    [client, selectedOrg],
  );

  const deleteOrg = useCallback(
    async (orgId: string) => {
      try {
        await client.auth.deleteOrg(orgId);
        setOrgs((prev) => prev.filter((o) => o.id !== orgId));
        if (selectedOrg?.id === orgId) {
          setSelectedOrg(null);
          clearPeople();
          storage?.removeItem(STORAGE_KEY);
        }
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to delete organization'));
        return false;
      }
    },
    [client, selectedOrg, clearPeople],
  );

  const uploadOrgAvatar = useCallback(
    async (orgId: string, imageBlob: Blob) => {
      try {
        const result = await client.auth.uploadOrgAvatar(orgId, imageBlob);
        setOrgs((prev) => prev.map((o) => (o.id === orgId ? { ...o, avatarUrl: result.avatarUrl } : o)));
        if (selectedOrg?.id === orgId)
          setSelectedOrg((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl } : prev));
        return result;
      } catch (err) {
        setError(errorMessage(err, 'Failed to upload org avatar'));
        return null;
      }
    },
    [client, selectedOrg],
  );

  return {
    orgs,
    selectedOrg,
    members: people.members,
    invites: people.invites,
    inviteLinks: people.inviteLinks,
    roles,
    isLoading,
    error,
    setError,
    refresh,
    selectOrg,
    createOrg,
    updateOrg,
    deleteOrg,
    sendInvite: people.sendInvite,
    refreshInvites: people.refreshInvites,
    revokeInvite: people.revokeInvite,
    createInviteLink: people.createInviteLink,
    refreshInviteLinks: people.refreshInviteLinks,
    revokeInviteLink: people.revokeInviteLink,
    getInviteLinkUrl: people.getInviteLinkUrl,
    updateMemberRole: people.updateMemberRole,
    updateMemberRoles: people.updateMemberRoles,
    removeMember: people.removeMember,
    refreshMembers: people.refreshMembers,
    refreshRoles,
    uploadOrgAvatar,
  };
}
