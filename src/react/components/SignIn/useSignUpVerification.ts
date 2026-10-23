import { useState } from 'react';

import type { PhoneOtpChannel } from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { usePhoneOtp } from '../../hooks/usePhoneOtp';
import { channelProblem, needsChannelChoice, onlyChannel } from './otpChannels';

/** Confirmation of a phone sign-up: pick a channel (when there are several), then enter the code. */
export function useSignUpVerification(identifier: string, channels: PhoneOtpChannel[] | null) {
  const { t, locale } = useSaaSContext();
  const phoneOtp = usePhoneOtp();
  const [step, setStep] = useState<'channel' | 'code' | null>(null);
  const [code, setCode] = useState('');
  const [channelError, setChannelError] = useState<string | null>(null);
  const canPick = needsChannelChoice(channels);

  /** Sends the code. False when the project cannot send one — the sign-up then goes on without it. */
  const send = async (channel?: PhoneOtpChannel) => {
    setChannelError(null);
    const outcome = await phoneOtp.send(identifier, 'register', { channel, locale });
    const problem = channelProblem(outcome, channel);
    if (problem) setChannelError(t(problem));
    if (outcome.status === 'sent') {
      setCode('');
      setStep('code');
    }
    if (outcome.status !== 'unavailable') return true;
    setStep(null);
    return false;
  };

  /** Starts from the password form. False: nothing to verify, register right away. */
  const start = async () => {
    if (!canPick) return send(onlyChannel(channels));
    setChannelError(null);
    setStep('channel');
    return true;
  };

  const resend = async () => {
    const outcome = await phoneOtp.resend();
    const problem = channelProblem(outcome, phoneOtp.channel ?? undefined);
    if (problem) setChannelError(t(problem));
  };

  const otherWay = () => {
    setStep('channel');
    setCode('');
    setChannelError(null);
    phoneOtp.setError(null);
  };

  const leave = () => {
    setStep(null);
    setCode('');
    setChannelError(null);
    phoneOtp.reset();
  };

  return {
    step,
    code,
    setCode,
    send,
    start,
    resend,
    otherWay: canPick ? otherWay : undefined,
    leave,
    /** Exchanges the entered code for the token `signUp` takes. */
    verify: async () => (await phoneOtp.verify(identifier, code, 'register'))?.otpToken ?? null,
    finish: () => {
      setStep(null);
      setCode('');
    },
    otpToken: phoneOtp.otpToken,
    channel: phoneOtp.channel,
    resendAfterSeconds: phoneOtp.resendAfterSeconds,
    error: channelError || phoneOtp.error,
    isLoading: phoneOtp.isLoading,
  };
}

export type SignUpVerification = ReturnType<typeof useSignUpVerification>;
