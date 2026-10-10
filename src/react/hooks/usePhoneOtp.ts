import { useCallback, useEffect, useState } from 'react';

import type { PhoneOtpPurpose } from '../../auth/types';
import { SaaSError } from '../../core/error';
import { useSaaSContext } from '../context';

export type PhoneOtpSendOutcome =
  | { status: 'sent'; resendAfterSeconds: number }
  /** The project has no SMS provider — continue without verification. */
  | { status: 'unavailable' }
  | { status: 'error' };

/**
 * Drives the SMS verification step of a phone sign-up or password reset.
 *
 * `unavailable` turns true when the project has no SMS provider configured. The
 * UI must then skip verification rather than block the user: the backend does
 * not require a code in that configuration either.
 */
export function usePhoneOtp() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [resendAfterSeconds, setResendAfterSeconds] = useState(0);

  // Count the resend cooldown down so the UI can disable the button.
  useEffect(() => {
    if (resendAfterSeconds <= 0) return;
    const timer = setTimeout(() => setResendAfterSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendAfterSeconds]);

  const send = useCallback(
    async (phone: string, purpose: PhoneOtpPurpose = 'register'): Promise<PhoneOtpSendOutcome> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.auth.sendPhoneOtp(phone, purpose);
        setResendAfterSeconds(result.resendAfterSeconds);
        return { status: 'sent', resendAfterSeconds: result.resendAfterSeconds };
      } catch (err) {
        // 409 means the project has no SMS provider. That is a configuration
        // state, not a failure: the caller continues without verification.
        if (err instanceof SaaSError && err.isConflict) {
          setUnavailable(true);
          return { status: 'unavailable' };
        }
        setError(err instanceof Error ? err.message : 'Failed to send the code');
        return { status: 'error' };
      } finally {
        setIsLoading(false);
      }
    },
    [client],
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

  return { send, verify, reset, otpToken, resendAfterSeconds, unavailable, isLoading, error, setError };
}
