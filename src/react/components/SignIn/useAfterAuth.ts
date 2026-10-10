import { useEffect, useEffectEvent, useRef } from 'react';

import type { User } from '../../../auth/types';

export interface AfterAuthOptions {
  onSignIn?: (user: User) => void;
  onSignUp?: (user: User) => void;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
}

/**
 * Hands control back to the host once a session appears while <SignIn> is on screen:
 * the callback when given (client-side navigation), else a full-page redirect to the URL.
 */
export function useAfterAuth(user: User | null, lastAction: 'signIn' | 'signUp', options: AfterAuthOptions) {
  const wasSignedIn = useRef(!!user);

  // Reads the latest callbacks without re-running the effect when the host passes new functions
  const handOff = useEffectEvent((signedInUser: User) => {
    const { onSignIn, onSignUp, afterSignInUrl, afterSignUpUrl } = options;
    const callback = lastAction === 'signUp' ? (onSignUp ?? onSignIn) : onSignIn;
    const url = lastAction === 'signUp' ? (afterSignUpUrl ?? afterSignInUrl) : afterSignInUrl;
    if (callback) callback(signedInUser);
    else if (url && typeof window !== 'undefined') window.location.href = url;
  });

  useEffect(() => {
    if (user && !wasSignedIn.current) handOff(user);
    wasSignedIn.current = !!user;
  }, [user]);
}
