import { useState, type FormEvent } from 'react';

import {
  isFaceRequired,
  isMfaRequired,
  type FaceRequiredResult,
  type PhoneOtpChannel,
  type SignUpResult,
} from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { usePhoneOtp } from '../../hooks/usePhoneOtp';
import { useSignIn } from '../../hooks/useSignIn';
import { channelProblem, channelUnavailableKey } from './otpChannels';

interface PhoneCodeOptions {
  identifier: string;
  inviteCode?: string;
  /** An existing account answered with its second factor. */
  onMfa: (mfaToken: string) => void;
  onFace: (challenge: FaceRequiredResult) => void;
  /** The code created the account: the same follow-up as a password sign-up. */
  onSignUp: (result: SignUpResult | FaceRequiredResult) => Promise<void>;
}

/** Sign-in with a phone number and a code alone: pick a channel, get the code, enter it. */
export function usePhoneCodeFlow({ identifier, inviteCode, onMfa, onFace, onSignUp }: PhoneCodeOptions) {
  const { t, locale } = useSaaSContext();
  const otp = usePhoneOtp();
  const api = useSignIn();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [channelError, setChannelError] = useState<string | null>(null);
  // The server, not the tab the user is on, decides whether this was a sign-in or a sign-up
  const [authAction, setAuthAction] = useState<'signIn' | 'signUp' | null>(null);

  const clearErrors = () => {
    setChannelError(null);
    otp.setError(null);
    api.setError(null);
  };

  const request = async (channel: PhoneOtpChannel) => {
    clearErrors();
    const outcome = await otp.send(identifier, 'login', { channel, locale, inviteCode });
    if (outcome.status === 'sent') {
      setCode('');
      setCodeSent(true);
      return;
    }
    // No channel left at all reads, for the user, the same as this one being down
    const problem =
      outcome.status === 'unavailable' ? channelUnavailableKey(channel) : channelProblem(outcome, channel);
    if (problem) setChannelError(t(problem));
  };

  const resend = async () => {
    clearErrors();
    const outcome = await otp.resend();
    const problem = channelProblem(outcome, otp.channel ?? undefined);
    if (problem) setChannelError(t(problem));
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const result = await api.signInWithPhoneCode(identifier, code, { inviteCode, faceChallenge: true });
    if (!result) return;
    setAuthAction(result.isNewUser ? 'signUp' : 'signIn');
    if (isMfaRequired(result)) {
      setCodeSent(false);
      onMfa(result.mfaToken);
    } else if (result.isNewUser) {
      await onSignUp(result);
    } else if (isFaceRequired(result)) {
      onFace(result);
    }
  };

  /** Back to the channel buttons. */
  const otherWay = () => {
    setCodeSent(false);
    setCode('');
    clearErrors();
  };

  /** Leaves the passwordless path: the password step, another identifier or the other mode. */
  const reset = () => {
    otherWay();
    setAuthAction(null);
    otp.reset();
  };

  return {
    codeSent,
    code,
    setCode,
    request,
    resend,
    submit,
    otherWay,
    reset,
    authAction,
    channel: otp.channel,
    resendAfterSeconds: otp.resendAfterSeconds,
    /** A code is being requested. */
    sending: otp.isLoading,
    error: channelError || otp.error || api.error,
    isLoading: api.isLoading,
  };
}

export type PhoneCodeFlow = ReturnType<typeof usePhoneCodeFlow>;
