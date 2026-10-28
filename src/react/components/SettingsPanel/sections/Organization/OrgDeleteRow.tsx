import { ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { ListItem } from '@/components/uiKit/List';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';

// The red row at the end; deleting is confirmed by typing the organization's name
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
      <ListItem
        leading={<Trash2 />}
        color="red"
        headline={t('org.delete')}
        supportingText={t('org.deleteHint')}
        wrapText
        trailing={<ChevronRight size={20} />}
        onClick={open}
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
