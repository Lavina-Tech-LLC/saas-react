import { Box, Button, Group, Modal, Text, TextInput } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useDeleteAccount } from '../../../../hooks/useDeleteAccount';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { SettingsRow } from '../../../ui/SettingsRow';

// Red row at the bottom of the profile; deletion is confirmed by typing the account's email or phone
export function DeleteAccountRow({ afterDeleteAccountUrl }: { afterDeleteAccountUrl?: string }) {
  const t = useT();
  const { user, signOut } = useAuth();
  const { deleteAccount, isLoading, error, setError } = useDeleteAccount();
  const [opened, setOpened] = useState(false);
  const [typed, setTyped] = useState('');
  const identifier = user?.email || user?.phone || '';
  const identifierLabel = user?.email ? t('settings.identifier.email') : t('settings.identifier.phone');

  const open = () => {
    setTyped('');
    setError(null);
    setOpened(true);
  };

  const remove = async () => {
    if (!(await deleteAccount())) return;
    await signOut();
    if (afterDeleteAccountUrl) window.location.href = afterDeleteAccountUrl;
  };

  return (
    <>
      <SettingsRow
        icon={Trash2}
        danger
        label={t('settings.deleteAccount')}
        description={t('settings.deleteAccountHint')}
        action={
          <Button size="xs" color="red" variant="light" leftSection={<Trash2 size={14} />} onClick={open}>
            {t('common.delete')}
          </Button>
        }
      />
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('settings.deleteAccount')}>
        <Box p="md">
          <Text fz="sm" mb="md">
            {t('settings.deleteAccountWarning')}
          </Text>
          <ErrorAlert message={error} />
          <TextInput
            label={t('settings.typeToConfirm', { identifier: identifierLabel })}
            placeholder={identifier}
            value={typed}
            onChange={(e) => setTyped(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              color="red"
              onClick={remove}
              loading={isLoading}
              disabled={identifier === '' || typed !== identifier}
            >
              {t('settings.deleteAccount')}
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}
