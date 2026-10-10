import { Avatar, Box, Button, Group, Modal, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core';
import { Camera } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { orgInitials } from '../../../ui/initials';
import { useColorVariant } from '../../../ui/useColorVariant';

interface OrgHeaderProps {
  org: Org;
  onUpdated: () => void;
}

// First row of the organization: logo (opens the cropper), name and slug; Rename opens a dialog
export function OrgHeader({ org, onUpdated }: OrgHeaderProps) {
  const t = useT();
  const colorVariant = useColorVariant();
  const { updateOrg, uploadOrgAvatar, error, setError } = useOrg();
  const [dialog, setDialog] = useState<'name' | 'logo' | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const open = (next: 'name' | 'logo') => {
    setError(null);
    setName(org.name);
    setDialog(next);
  };

  const rename = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const updated = await updateOrg(org.id, { name: name.trim() });
    setBusy(false);
    if (!updated) return;
    setDialog(null);
    onUpdated();
  };

  const uploadLogo = async (blob: Blob) => {
    setBusy(true);
    const result = await uploadOrgAvatar(org.id, blob);
    setBusy(false);
    if (!result) return;
    setDialog(null);
    onUpdated();
  };

  return (
    <Group px="md" py="md" gap="md" wrap="nowrap" justify="space-between">
      <Group gap="md" wrap="nowrap" miw={0}>
        <UnstyledButton onClick={() => open('logo')} aria-label={t('org.changeLogo')} pos="relative">
          <Avatar src={org.avatarUrl} size={64} radius="md" color="initials" name={org.name}>
            {orgInitials(org.name)}
          </Avatar>
          <Avatar pos="absolute" bottom={-2} right={-2} size={24} radius="xl" variant="filled">
            <Camera size={12} />
          </Avatar>
        </UnstyledButton>
        <Stack gap={2} miw={0}>
          <Title order={4} lineClamp={1}>
            {org.name}
          </Title>
          <Text fz="sm" c="dimmed" ff="monospace" truncate>
            {org.slug}
          </Text>
        </Stack>
      </Group>
      <Button size="xs" variant={colorVariant} onClick={() => open('name')}>
        {t('org.rename')}
      </Button>

      <Modal opened={dialog === 'name'} onClose={() => setDialog(null)} title={t('org.rename')}>
        <Box p="md" component="form" onSubmit={rename}>
          <ErrorAlert message={error} />
          <TextInput
            label={t('org.name')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            data-autofocus
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={busy} disabled={!name.trim() || name.trim() === org.name}>
              {t('common.saveShort')}
            </Button>
          </Group>
        </Box>
      </Modal>
      <AvatarUploadModal
        opened={dialog === 'logo'}
        onClose={() => setDialog(null)}
        onUpload={uploadLogo}
        isLoading={busy}
        uploadError={dialog === 'logo' ? error : null}
      />
    </Group>
  );
}
