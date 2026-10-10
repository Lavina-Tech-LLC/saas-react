import { useCallback, useState } from 'react';

import type { IdentifierKind } from '../../auth/identifier';
import type { AuthResult, OAuthProvider } from '../../auth/types';
import { useSaaSContext } from '../context';

export function useSignIn() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async (identifier: string, password: string, kind?: IdentifierKind): Promise<AuthResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.signIn(identifier, password, kind);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign in failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider, inviteCode?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.signInWithOAuth(provider, inviteCode);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth sign in failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const submitMfaCode = useCallback(
    async (mfaToken: string, code: string) => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.submitMfaCode(mfaToken, code);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MFA verification failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  return { signIn, signInWithOAuth, submitMfaCode, isLoading, error, setError };
}

/** `signUp` as `useSignUp` returns it: the client's overloads, failing to null. */
