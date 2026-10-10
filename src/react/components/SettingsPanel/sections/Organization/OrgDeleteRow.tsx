import { Box, Button, Group, Modal, Text, TextInput } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { SettingsRow } from '../../../ui/SettingsRow';

// Red row at the bottom; deletion is confirmed by typing the organization's name
export function OrgDeleteRow({ org, onDeleted }: { org: Org; onDeleted: () => void }) {
  const t = useT();
  const { deleteOrg, error, setError } = useOrg();
  const [opened, setOpened] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const open = () => {
    setTyped('');
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
          <Button size="xs" color="red" variant="light" leftSection={<Trash2 size={14} />} onClick={open}>
            {t('common.delete')}
          </Button>
        }
      />
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('org.delete')}>
        <Box p="md">
          <Text fz="sm" mb="md">
            {t('org.deleteWarning')}
          </Text>
          <ErrorAlert message={error} />
          <TextInput
            label={t('org.typeNameToConfirm')}
            placeholder={org.name}
            value={typed}
            onChange={(e) => setTyped(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setOpened(false)} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button color="red" onClick={remove} loading={busy} disabled={typed !== org.name}>
              {t('org.delete')}
            </Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}
