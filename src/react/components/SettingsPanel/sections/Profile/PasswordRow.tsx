import { Button, PasswordInput, Stack } from '@mantine/core';
import { Lock, Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { AppModal } from '@/components/uiKit/AppModal';
import { SettingsRow } from '@/components/uiKit/SettingsRow';

import { useSaaSContext } from '../../../../context';
import { useProfile } from '../../../../hooks/useProfile';
import { checkNewPassword } from '../../../SignIn/NewPasswordFields';

const FORM = 'saas-change-password';

// The password row; Change opens the form with the current and the new password
export function PasswordRow({ onChanged }: { onChanged: () => void }) {
  const { t, settings } = useSaaSContext();
  const { changePassword, isLoading, error, setError } = useProfile();
  const [opened, setOpened] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const minLength = settings?.passwordMinLength ?? 8;

  const open = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setValidationError(null);
    setError(null);
    setOpened(true);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = checkNewPassword(next, confirm, minLength, t);
    setValidationError(problem);
    if (problem || !(await changePassword(current, next))) return;
    setOpened(false);
    onChanged();
  };
  const problem = validationError || error;

  return (
    <>
      <SettingsRow
        icon={Lock}
        color="orange"
        label={t('signIn.password')}
        description={t('settings.passwordHint', { min: minLength })}
        action={
          <Button variant="light" leftSection={<Pencil size={16} />} onClick={open}>
            {t('common.change')}
          </Button>
        }
      />
      <AppModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('settings.changePassword')}
        size="md"
        mainAction={{ label: t('settings.changePassword'), form: FORM, loading: isLoading }}
      >
        <Stack component="form" id={FORM} onSubmit={submit} gap="md">
          {problem && <AppAlert severity="error">{problem}</AppAlert>}
          <PasswordInput
            label={t('settings.currentPassword')}
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.currentTarget.value)}
            required
            data-autofocus
          />
          <PasswordInput
            label={t('settings.newPassword')}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label={t('settings.confirmNewPassword')}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            required
          />
        </Stack>
      </AppModal>
    </>
  );
}
