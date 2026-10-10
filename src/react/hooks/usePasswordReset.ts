import { useCallback, useState } from 'react';

import { useSaaSContext } from '../context';
import { errorMessage } from './errorMessage';

/** Forgotten-password flows: an emailed link (token) or an SMS code (phone accounts). */
export function usePasswordReset() {
  const { client } = useSaaSContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<void>, fallback: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(errorMessage(err, fallback));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Emails a reset link that points back to `redirectUrl` with the reset token. */
  const sendEmailLink = useCallback(
    (email: string, redirectUrl: string) =>
      run(() => client.auth.sendPasswordReset(email, redirectUrl), 'Failed to send the reset link'),
    [client, run],
  );

  /** Sets a new password with the token from the emailed link. */
  const resetWithToken = useCallback(
    (token: string, newPassword: string) =>
      run(() => client.auth.resetPassword(token, newPassword), 'Failed to reset the password'),
    [client, run],
  );

  /** Sets a new password for a phone account, authorized by a verified "reset" SMS code. */
  const resetByPhone = useCallback(
    (phone: string, otpToken: string, newPassword: string) =>
      run(() => client.auth.resetPasswordByPhone(phone, otpToken, newPassword), 'Failed to reset the password'),
    [client, run],
  );

  return { sendEmailLink, resetWithToken, resetByPhone, isLoading, error, setError };
}
