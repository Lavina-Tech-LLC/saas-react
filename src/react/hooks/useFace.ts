import { useCallback, useState } from 'react';

import type { FaceSample, FaceStatus } from '../../auth/types';
import { useSaaSContext } from '../context';

export function useFace() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FaceStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const result = await client.auth.getFaceStatus();
      setStatus(result);
      return result;
    } catch {
      return null;
    }
  }, [client]);

  const enroll = useCallback(
    async (samples: FaceSample[], options?: { faceToken?: string; model?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.enrollFace(samples, options ?? {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save face data');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const verify = useCallback(
    async (faceToken: string, descriptor: number[]) => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.verifyFace(faceToken, descriptor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Face verification failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const remove = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.auth.deleteFace();
      await refreshStatus();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove face data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, refreshStatus]);

  return { enroll, verify, remove, status, refreshStatus, isLoading, error, setError };
}

/** What happened when a one-time code was requested. */
