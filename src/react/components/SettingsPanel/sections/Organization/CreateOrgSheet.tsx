import { Button, Stack, TextInput } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { BottomSheet } from '@/components/uiKit/Sheets';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';

const FORM = 'saas-create-org';
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

interface CreateOrgSheetProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (org: Org) => void;
}

// A new organization in a bottom sheet (LM3 §20): its name, the address made from it; then it becomes the selected one
export function CreateOrgSheet({ opened, onClose, onCreated }: CreateOrgSheetProps) {
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
    <BottomSheet
      opened={opened}
      onClose={close}
      title={t('org.createTitle')}
      actions={
        <>
          <Button variant="default" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM} loading={busy} disabled={!slug}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <Stack component="form" id={FORM} onSubmit={submit} gap="md">
        {error && <AppAlert severity="error">{error}</AppAlert>}
        <TextInput
          label={t('org.name')}
          description={slug ? `${t('org.slugPreview')} ${slug}` : undefined}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          data-autofocus
        />
      </Stack>
    </BottomSheet>
  );
}
