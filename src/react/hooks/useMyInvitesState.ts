import { useCallback, useEffect, useState } from 'react';

import type { MyPendingInvite } from '../../auth/types';
import { useSaaSContext } from '../context';
import { errorMessage } from './errorMessage';

// The current user's pending invitations — run once by <SaaSProvider> and read through useInvites().
export function useMyInvitesState() {
  const { client, user, isLoaded } = useSaaSContext();
  const [invites, setInvites] = useState<MyPendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await client.auth.listMyInvites();
      setInvites(list);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load invites'));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount: syncing with the server is what effects are for
    if (isLoaded && user) refresh();
  }, [isLoaded, user, refresh]);

  const accept = useCallback(
    async (inviteId: string) => {
      try {
        const result = await client.auth.acceptInviteById(inviteId);
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        return result;
      } catch (err) {
        setError(errorMessage(err, 'Failed to accept invite'));
        return null;
      }
    },
    [client],
  );

  const decline = useCallback(
    async (inviteId: string) => {
      try {
        await client.auth.declineInvite(inviteId);
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        return true;
      } catch (err) {
        setError(errorMessage(err, 'Failed to decline invite'));
        return false;
      }
    },
    [client],
  );

  return { invites, isLoading, error, setError, refresh, accept, decline };
}
