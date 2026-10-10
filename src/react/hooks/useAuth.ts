import { useCallback } from 'react';

import { useSaaSContext } from '../context';

export function useAuth() {
  const { client, user, isLoaded } = useSaaSContext();

  return {
    isLoaded,
    isSignedIn: !!user,
    user,
    signOut: useCallback(() => client.auth.signOut(), [client]),
    getToken: useCallback(() => client.auth.getToken(), [client]),
    refreshUser: useCallback(() => client.auth.refreshUser(), [client]),
  };
}
