import { Button, Group, Stack } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { useSaaSContext } from '../../context';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { AuthCard } from '../ui/AuthCard';
import { ErrorAlert } from '../ui/ErrorAlert';
import { SuccessAlert } from '../ui/SuccessAlert';
import { TextLink } from '../ui/TextLink';
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
        <SuccessAlert>{t('forgot.done')}</SuccessAlert>
        {onDone && (
          <Group justify="center">
            <TextLink onClick={onDone}>{t('forgot.back')}</TextLink>
          </Group>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('reset.title')} subtitle={t('reset.subtitle')}>
      <ErrorAlert message={validationError || reset.error} />
      <form onSubmit={submit}>
        <Stack gap="md">
          <NewPasswordFields
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
          />
          <Button type="submit" fullWidth loading={reset.isLoading}>
            {t('forgot.submit')}
          </Button>
        </Stack>
      </form>
      {onDone && (
        <Group justify="center">
          <TextLink onClick={onDone}>{t('forgot.back')}</TextLink>
        </Group>
      )}
    </AuthCard>
  );
}
