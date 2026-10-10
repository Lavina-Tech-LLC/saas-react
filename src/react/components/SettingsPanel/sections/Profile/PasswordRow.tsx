import { Box, Button, Group, Modal, PasswordInput, Stack } from '@mantine/core';
import { Lock, Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { useSaaSContext } from '../../../../context';
import { useProfile } from '../../../../hooks/useProfile';
import { checkNewPassword } from '../../../SignIn/NewPasswordFields';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { SettingsRow } from '../../../ui/SettingsRow';
import { useColorVariant } from '../../../ui/useColorVariant';

// Password row; Change opens the dialog with the current and the new password
export function PasswordRow({ onChanged }: { onChanged: () => void }) {
  const { t, settings } = useSaaSContext();
  const colorVariant = useColorVariant();
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

  return (
    <>
      <SettingsRow
        icon={Lock}
        color="orange"
        label={t('signIn.password')}
        description={t('settings.passwordHint', { min: minLength })}
        action={
          <Button size="xs" variant={colorVariant} leftSection={<Pencil size={14} />} onClick={open}>
            {t('common.change')}
          </Button>
        }
      />
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('settings.changePassword')}>
        <Box p="md" component="form" onSubmit={submit}>
          <Stack gap="md">
            <ErrorAlert message={validationError || error} />
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
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isLoading}>
              {t('settings.changePassword')}
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}
