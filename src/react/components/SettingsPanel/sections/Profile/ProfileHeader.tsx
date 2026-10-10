import { Avatar, Badge, Box, Button, Group, Modal, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core';
import { BadgeCheck, Camera, Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { userInitial } from '../../../ui/initials';
import { useColorVariant } from '../../../ui/useColorVariant';

// First row of the profile: who you are. The avatar opens the cropper, Edit opens the name dialog.
export function ProfileHeader({ onSaved }: { onSaved: (notice: TranslationKey) => void }) {
  const t = useT();
  const colorVariant = useColorVariant();
  const { user } = useAuth();
  const profile = useProfile();
  const [dialog, setDialog] = useState<'name' | 'avatar' | null>(null);
  const [name, setName] = useState('');
  const verified = user?.emailVerified || user?.phoneVerified;

  const openName = () => {
    setName(user?.name ?? '');
    profile.setError(null);
    setDialog('name');
  };

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await profile.updateProfile({ name, avatarUrl: user?.avatarUrl || undefined }))) return;
    setDialog(null);
    onSaved('settings.profileSaved');
  };

  const uploadAvatar = async (blob: Blob) => {
    if (!(await profile.uploadAvatar(blob))) return;
    setDialog(null);
    onSaved('settings.avatarUpdated');
  };

  return (
    <Group px="md" py="md" gap="md" wrap="nowrap" justify="space-between">
      <Group gap="md" wrap="nowrap" miw={0}>
        <UnstyledButton onClick={() => setDialog('avatar')} aria-label={t('settings.changeAvatar')} pos="relative">
          <Avatar src={user?.avatarUrl} size={64} radius="xl" color="initials" name={user?.name}>
            {userInitial(user)}
          </Avatar>
          <Avatar pos="absolute" bottom={-2} right={-2} size={24} radius="xl" variant="filled">
            <Camera size={12} />
          </Avatar>
        </UnstyledButton>
        <Stack gap={2} miw={0}>
          <Group gap="xs" wrap="nowrap" miw={0}>
            <Title order={4} lineClamp={1}>
              {user?.name || t('settings.unnamedUser')}
            </Title>
            {verified && (
              <Badge size="md" color="green" variant={colorVariant} leftSection={<BadgeCheck size={14} />}>
                {t('common.verified')}
              </Badge>
            )}
          </Group>
          <Text fz="sm" c="dimmed" truncate>
            {user?.email || user?.phone}
          </Text>
        </Stack>
      </Group>
      <Button size="xs" variant={colorVariant} leftSection={<Pencil size={14} />} onClick={openName}>
        {t('common.edit')}
      </Button>

      <Modal opened={dialog === 'name'} onClose={() => setDialog(null)} title={t('settings.editName')}>
        <Box p="md" component="form" onSubmit={saveName}>
          <ErrorAlert message={profile.error} />
          <TextInput
            label={t('settings.fullName')}
            placeholder={t('settings.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={profile.isLoading}>
              {t('common.saveShort')}
            </Button>
          </Group>
        </Box>
      </Modal>
      <AvatarUploadModal
        opened={dialog === 'avatar'}
        onClose={() => setDialog(null)}
        onUpload={uploadAvatar}
        isLoading={profile.isLoading}
      />
    </Group>
  );
}
