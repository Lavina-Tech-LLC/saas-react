import { Button, Stack } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';

import { useSaaSContext } from '../../context';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { AuthActions } from '../ui/AuthActions';
import { AuthCard } from '../ui/AuthCard';
import { checkNewPassword, NewPasswordFields } from './NewPasswordFields';
import { deriveSignInSettings } from './signInSettings';

// Landing screen of the emailed reset link: the host passes the token from its URL
export function ResetPassword({ token, onDone }: { token: string; onDone?: () => void }) {
  const { settings, t } = useSaaSContext();
  const reset = usePasswordReset();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = checkNewPassword(password, confirm, deriveSignInSettings(settings).passwordMinLength, t);
    setValidationError(problem);
    if (!problem && (await reset.resetWithToken(token, password))) setDone(true);
  };

  if (done) {
    return (
      <AuthCard title={t('reset.title')}>
        <AppAlert severity="success">{t('forgot.done')}</AppAlert>
        {onDone && (
          <AuthActions>
            <Button onClick={onDone}>{t('forgot.back')}</Button>
          </AuthActions>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('reset.title')} subtitle={t('reset.subtitle')}>
      {(validationError || reset.error) && <AppAlert severity="error">{validationError || reset.error}</AppAlert>}
      <form onSubmit={submit}>
        <Stack gap="md">
          <NewPasswordFields
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
          />
          <AuthActions
            start={
              onDone && (
                <Button variant="subtle" onClick={onDone}>
                  {t('forgot.back')}
                </Button>
              )
            }
          >
            <Button type="submit" loading={reset.isLoading}>
              {t('forgot.submit')}
            </Button>
          </AuthActions>
        </Stack>
      </form>
    </AuthCard>
  );
}
