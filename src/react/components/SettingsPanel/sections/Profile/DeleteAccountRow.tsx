import { ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { ListItem } from '@/components/uiKit/List';

import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useDeleteAccount } from '../../../../hooks/useDeleteAccount';

// The red row at the end of the profile; deleting is confirmed by typing the account's email or phone
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
      <ListItem
        leading={<Trash2 />}
        color="red"
        headline={t('settings.deleteAccount')}
        supportingText={t('settings.deleteAccountHint')}
        wrapText
        trailing={<ChevronRight size={20} />}
        onClick={open}
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
