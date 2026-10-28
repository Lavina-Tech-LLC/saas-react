import { Button } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { SettingsRow } from '@/components/uiKit/SettingsRow';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';

// The red tile at the end; deleting is confirmed by typing the organization's name
export function OrgDeleteRow({ org, onDeleted }: { org: Org; onDeleted: () => void }) {
  const t = useT();
  const { deleteOrg, error, setError } = useOrg();
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = () => {
    setError(null);
    setOpened(true);
  };
  const remove = async () => {
    setBusy(true);
    const ok = await deleteOrg(org.id);
    setBusy(false);
    if (ok) onDeleted();
  };

  return (
    <>
      <SettingsRow
        icon={Trash2}
        danger
        label={t('org.delete')}
        description={t('org.deleteHint')}
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
        title={t('org.deleteTitle', { name: org.name })}
        description={t('org.deleteWarning')}
        confirmLabel={t('org.delete')}
        loading={busy}
        error={opened ? error : undefined}
        confirmText={org.name}
      />
    </>
  );
}
