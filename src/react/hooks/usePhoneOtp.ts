import { useCallback, useEffect, useState } from 'react';

import type { PhoneOtpChannel, PhoneOtpPurpose, PhoneOtpSendOptions } from '../../auth/types';
import { SaaSError } from '../../core/error';
import { useSaaSContext } from '../context';

export type PhoneOtpSendOutcome =
  | { status: 'sent'; resendAfterSeconds: number }
  /** The project has no delivery channel — continue without verification. */
  | { status: 'unavailable' }
  /**
   * `reason` is set when another channel may still work: the number is not on
   * the requested messenger (`notReachable`), or that channel is down for now
   * (`channelUnavailable`).
   */
  | { status: 'error'; reason?: 'notReachable' | 'channelUnavailable' };

interface SentRequest {
  phone: string;
  purpose: PhoneOtpPurpose;
  options?: PhoneOtpSendOptions;
}

/** Why a send failed, when picking another channel may help. */
function retryReason(err: unknown) {
  if (!(err instanceof SaaSError)) return undefined;
  if (err.code === 422) return 'notReachable' as const;
  if (err.code === 503) return 'channelUnavailable' as const;
  return undefined;
}

/**
 * Drives the one-time-code step of a phone sign-up, password reset or
 * passwordless sign-in.
 *
 * `unavailable` turns true when the project has no delivery channel. The UI
 * must then skip verification rather than block the user: the backend does not
 * require a code in that configuration either.
 */
export function usePhoneOtp() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [resendAfterSeconds, setResendAfterSeconds] = useState(0);
  const [channel, setChannel] = useState<PhoneOtpChannel | null>(null);
  const [lastRequest, setLastRequest] = useState<SentRequest | null>(null);

  // Count the resend cooldown down so the UI can disable the button.
  useEffect(() => {
    if (resendAfterSeconds <= 0) return;
    const timer = setTimeout(() => setResendAfterSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendAfterSeconds]);

  const send = useCallback(
    async (
      phone: string,
      purpose: PhoneOtpPurpose = 'register',
      options?: PhoneOtpSendOptions,
    ): Promise<PhoneOtpSendOutcome> => {
      setIsLoading(true);
      setError(null);
      setLastRequest({ phone, purpose, options });
      try {
        const result = await client.auth.sendPhoneOtp(phone, purpose, options);
        setResendAfterSeconds(result.resendAfterSeconds);
        setChannel(result.channel ?? options?.channel ?? null);
        return { status: 'sent', resendAfterSeconds: result.resendAfterSeconds };
      } catch (err) {
        // 409 means the project has no delivery channel. That is a configuration
        // state, not a failure: the caller continues without verification.
        if (err instanceof SaaSError && err.isConflict) {
          setUnavailable(true);
          return { status: 'unavailable' };
        }
        setError(err instanceof Error ? err.message : 'Failed to send the code');
        const reason = retryReason(err);
        return reason ? { status: 'error', reason } : { status: 'error' };
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  /** Requests a new code for the number, purpose and channel of the last `send`. */
  const resend = useCallback(
    (): Promise<PhoneOtpSendOutcome> =>
      lastRequest
        ? send(lastRequest.phone, lastRequest.purpose, lastRequest.options)
        : Promise.resolve({ status: 'error' }),
    [lastRequest, send],
  );

  const verify = useCallback(
    async (phone: string, code: string, purpose: PhoneOtpPurpose = 'register') => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.auth.verifyPhoneOtp(phone, code, purpose);
        setOtpToken(result.otpToken);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid verification code');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const reset = useCallback(() => {
    setOtpToken(null);
    setError(null);
    setResendAfterSeconds(0);
  }, []);

  return {
    send,
    resend,
    verify,
    reset,
    otpToken,
    resendAfterSeconds,
    /** The channel the last code went through; null before the first one or on an older server. */
    channel,
    unavailable,
    isLoading,
    error,
    setError,
  };
}
