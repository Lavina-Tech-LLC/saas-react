import { Button } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { SettingsRow } from '@/components/uiKit/SettingsRow';

import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useDeleteAccount } from '../../../../hooks/useDeleteAccount';

// The red tile at the end of the profile; deleting is confirmed by typing the account's email or phone
export function DeleteAccountRow({ afterDeleteAccountUrl }: { afterDeleteAccountUrl?: string }) {
  const t = useT();
  const { user, signOut } = useAuth();
  const { deleteAccount, isLoading, error, setError } = useDeleteAccount();
  const [opened, setOpened] = useState(false);
  const identifier = user?.email || user?.phone || '';

  const open = () => {
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
          <Button variant="light" color="red" onClick={open}>
            {t('common.delete')}
          </Button>
        }
      />
      <ConfirmDialog
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={remove}
        title={t('settings.deleteAccountTitle')}
        description={t('settings.deleteAccountWarning')}
        confirmLabel={t('settings.deleteAccount')}
        loading={isLoading}
        error={error}
        confirmText={identifier || undefined}
      />
    </>
  );
}
