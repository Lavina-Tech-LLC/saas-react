import { Button, PasswordInput, Stack } from '@mantine/core';
import { ChevronRight, Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { ListItem } from '@/components/uiKit/List';
import { BottomSheet } from '@/components/uiKit/Sheets';

import { useSaaSContext } from '../../../../context';
import { useProfile } from '../../../../hooks/useProfile';
import { checkNewPassword } from '../../../SignIn/NewPasswordFields';

const FORM = 'saas-change-password';

// The password row; pressing it opens the current and the new password in a bottom sheet
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
      <ListItem
        leading={<Lock />}
        headline={t('signIn.password')}
        supportingText={t('settings.passwordHint', { min: minLength })}
        trailing={<ChevronRight size={20} />}
        onClick={open}
      />
      <BottomSheet
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('settings.changePassword')}
        actions={
          <>
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form={FORM} loading={isLoading}>
              {t('settings.changePassword')}
            </Button>
          </>
        }
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
      </BottomSheet>
    </>
  );
}
