import { useCallback, useState } from 'react';

import { useSaaSContext } from '../context';

export function useDeleteAccount() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.auth.deleteAccount();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return { deleteAccount, isLoading, error, setError };
}
