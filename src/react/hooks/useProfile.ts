import { useCallback, useState } from 'react';

import { useSaaSContext } from '../context';

export function useProfile() {
  const { client, user } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (params: { name?: string; avatarUrl?: string; metadata?: Record<string, unknown> }) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await client.auth.updateProfile(params);
        setSuccess('Profile updated');
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await client.auth.changePassword(currentPassword, newPassword);
        setSuccess('Password changed successfully');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to change password');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const uploadAvatar = useCallback(
    async (imageBlob: Blob) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const result = await client.auth.uploadAvatar(imageBlob);
        setSuccess('Avatar updated');
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload avatar');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  return { user, updateProfile, uploadAvatar, changePassword, isLoading, error, success, setError, setSuccess };
}
