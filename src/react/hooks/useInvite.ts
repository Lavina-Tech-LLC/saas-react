import { useCallback, useState } from 'react';

import type { AcceptInviteByCodeResult, InviteInfo } from '../../auth/types';
import { useSaaSContext } from '../context';

export function useInvite() {
  const { client, user, isLoaded } = useSaaSContext();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(
    async (code: string): Promise<InviteInfo | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.auth.getInviteInfo(code);
        setInfo(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid or expired invite');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const accept = useCallback(
    async (code: string): Promise<AcceptInviteByCodeResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.acceptInviteByCode(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to accept invite');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  return { info, isLoading, error, setError, fetchInfo, accept, isAuthenticated: !!user, isLoaded };
}

/**
 * Manages the current user's programmatic API keys within a specific org.
 * Pass the active orgId; the hook auto-refreshes whenever it changes.
 * The plaintext secret returned by `create` is only available in that call's
 * resolved value — it is never stored by the hook.
 */
