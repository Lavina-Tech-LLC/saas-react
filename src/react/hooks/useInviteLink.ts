import { useCallback, useState } from 'react';

import type { InviteLinkInfo, UseInviteLinkResult } from '../../auth/types';
import { useSaaSContext } from '../context';

export function useInviteLink() {
  const { client, user, isLoaded } = useSaaSContext();
  const [info, setInfo] = useState<InviteLinkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.auth.getInviteLinkInfo(code);
        setInfo(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid or expired invite link');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const use = useCallback(
    async (code: string): Promise<UseInviteLinkResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.auth.useInviteLink(code);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join organization');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  return { info, isLoading, error, setError, fetchInfo, use, isAuthenticated: !!user, isLoaded };
}

/**
 * Unified invite hook. Works for both per-email `AuthInvite` raw tokens and
 * reusable `AuthInviteLink` codes under a single `?invite_code=` URL param.
 *
 * `fetchInfo(code)` hits the public info endpoint — no auth required, safe to
 * call on the login screen before the user has a session.
 *
 * `accept(code)` hits the authenticated accept endpoint — requires a session.
 */
