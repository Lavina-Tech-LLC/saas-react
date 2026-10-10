import { useCallback, useEffect, useState } from 'react';

import type { ApiKey, CreateApiKeyInput, CreatedApiKey } from '../../auth/types';
import { useSaaSContext } from '../context';

export function useApiKeys(orgId: string | null | undefined) {
  const { client, user, isLoaded } = useSaaSContext();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setKeys([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await client.auth.listApiKeys(orgId);
      setKeys(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  }, [client, orgId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount: syncing with the server is what effects are for
    if (isLoaded && user && orgId) refresh();
  }, [isLoaded, user, orgId, refresh]);

  const create = useCallback(
    async (input: CreateApiKeyInput): Promise<CreatedApiKey | null> => {
      if (!orgId) return null;
      setError(null);
      try {
        const created = await client.auth.createApiKey(orgId, input);
        const { key: _plaintext, ...rest } = created;
        void _plaintext;
        setKeys((prev) => [rest as ApiKey, ...prev]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create API key');
        return null;
      }
    },
    [client, orgId],
  );

  const revoke = useCallback(
    async (keyId: string): Promise<boolean> => {
      if (!orgId) return false;
      setError(null);
      try {
        await client.auth.revokeApiKey(orgId, keyId);
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to revoke API key');
        return false;
      }
    },
    [client, orgId],
  );

  return { keys, isLoading, error, setError, refresh, create, revoke };
}
