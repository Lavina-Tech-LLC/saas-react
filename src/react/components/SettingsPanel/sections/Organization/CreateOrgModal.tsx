import { Box, Button, Group, Modal, Text, TextInput } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { ErrorAlert } from '../../../ui/ErrorAlert';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

interface CreateOrgModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (org: Org) => void;
}

// LM3 §20 — new organization: a name, its address derived live, then it becomes the selected organization
export function CreateOrgModal({ opened, onClose, onCreated }: CreateOrgModalProps) {
  const t = useT();
  const { createOrg, selectOrg, error, setError } = useOrg();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const slug = toSlug(name);

  const close = () => {
    setName('');
    setError(null);
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const org = await createOrg(name.trim(), slug);
    if (org) await selectOrg(org.id);
    setBusy(false);
    if (!org) return;
    close();
    onCreated(org);
  };

  return (
    <Modal opened={opened} onClose={close} title={t('org.createTitle')}>
      <Box p="md" component="form" onSubmit={submit}>
        <ErrorAlert message={error} />
        <TextInput
          label={t('org.name')}
          placeholder={t('org.newPlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          data-autofocus
        />
        {slug && (
          <Text fz="xs" c="dimmed" mt={6}>
            {t('org.slugPreview')}{' '}
            <Text span ff="monospace" fz="xs">
              {slug}
            </Text>
          </Text>
        )}
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={busy} disabled={!slug}>
            {t('common.create')}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
