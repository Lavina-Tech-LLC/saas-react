import { useCallback, useState } from 'react';

import type { IdentifierKind } from '../../auth/identifier';
import type { FaceRequiredResult, SignUpOptions, SignUpResult } from '../../auth/types';
import { useSaaSContext } from '../context';

type SignUpFn = {
  (
    identifier: string,
    password: string,
    options: SignUpOptions & { faceChallenge: true },
  ): Promise<SignUpResult | FaceRequiredResult | null>;
  (
    identifier: string,
    password: string,
    optionsOrInviteCode?: SignUpOptions | string,
    kind?: IdentifierKind,
  ): Promise<SignUpResult | null>;
};

export function useSignUp() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp: SignUpFn = useCallback(
    async (
      identifier: string,
      password: string,
      optionsOrInviteCode?: SignUpOptions | string,
      kind?: IdentifierKind,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        return await client.auth.signUp(identifier, password, optionsOrInviteCode, kind);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  return { signUp, isLoading, error, setError };
}

/**
 * Face control operations: enrolling a template, verifying against it, and
 * reading or clearing the current user's enrollment.
 *
 * Capturing the face itself is the `<FaceScanner/>` component's job — this hook
 * only talks to the API with the samples it produces.
 */
