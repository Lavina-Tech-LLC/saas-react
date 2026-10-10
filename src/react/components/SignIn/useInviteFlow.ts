import { useCallback, useEffect, useState } from 'react';

import { useT } from '../../context';
import { useAuth } from '../../hooks/useAuth';
import { useInvite } from '../../hooks/useInvite';
import { clearInviteFromUrl, resolveInitialInviteCode } from './inviteUrl';

/**
 * Invite handling on the sign-in screen: load the invite from `?invite_code=`, accept it when signed in,
 * or reveal the sign-up form for guests and accept automatically once they have an account.
 */
export function useInviteFlow(inviteCode?: string) {
  const t = useT();
  const { isSignedIn, refreshUser, user } = useAuth();
  const invite = useInvite();
  const { info, isLoading, error, setError, fetchInfo, accept } = invite;
  const [code, setCode] = useState<string | null>(() => resolveInitialInviteCode(inviteCode));
  const [showSignUp, setShowSignUp] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!code || info || isLoading || error) return;
    void fetchInfo(code);
  }, [code, info, isLoading, error, fetchInfo]);

  /** Leaves the invite: the URL, the code and any error are cleared. */
  const dismiss = useCallback(() => {
    clearInviteFromUrl();
    setCode(null);
    setShowSignUp(false);
    setError(null);
  }, [setError]);

  // A guest who signed up (or in) through the invite joins the org right away.
  // A 409 here is expected when sign-up already consumed the invite.
  useEffect(() => {
    if (!showSignUp || !code || !isSignedIn) return;
    let cancelled = false;
    void (async () => {
      await accept(code);
      if (cancelled) return;
      dismiss();
      await refreshUser();
    })();
    return () => {
      cancelled = true;
    };
  }, [showSignUp, code, isSignedIn, accept, dismiss, refreshUser]);

  /** Signed-in users join immediately; guests return false so the caller can reveal sign-up. */
  const acceptAsSignedIn = useCallback(async () => {
    if (!code) return;
    setAcceptError(null);
    setIsAccepting(true);
    try {
      const result = await accept(code);
      if (!result) {
        setAcceptError(t('invite.failed'));
        return;
      }
      dismiss();
      await refreshUser();
    } finally {
      setIsAccepting(false);
    }
  }, [code, accept, dismiss, refreshUser, t]);

  return {
    code,
    info,
    isLoading,
    error,
    acceptError,
    isAccepting,
    showSignUp,
    setShowSignUp,
    isSignedIn,
    user,
    dismiss,
    acceptAsSignedIn,
    /** Invite code to attach to sign-up / OAuth while the invite sign-up form is shown. */
    activeCode: showSignUp && code ? code : undefined,
  };
}

export type InviteFlow = ReturnType<typeof useInviteFlow>;
