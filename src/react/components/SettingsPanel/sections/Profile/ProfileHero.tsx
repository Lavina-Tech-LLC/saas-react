import { ActionIcon, Avatar, Box, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Camera } from 'lucide-react';
import { useState } from 'react';

import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { userInitial } from '../../../ui/initials';

// A solid tonal circle on the photo's edge, cut out of it by a ring in the page tone (as on Google's profile photo)
const CAMERA = {
  backgroundColor: 'var(--m3-surface-container-highest)',
  border: '3px solid var(--mantine-color-body)',
  color: 'var(--mantine-color-text)',
};

// The person first, as on the Google Account home: a large photo with a camera to change it, the name, the address
export function ProfileHero({ onSaved }: { onSaved: (notice: TranslationKey) => void }) {
  const t = useT();
  const { user } = useAuth();
  const profile = useProfile();
  const [opened, setOpened] = useState(false);
  const changePhoto = t('settings.changeAvatar');

  const upload = async (blob: Blob) => {
    if (!(await profile.uploadAvatar(blob))) return;
    setOpened(false);
    onSaved('settings.avatarUpdated');
  };

  return (
    <Stack align="center" gap={4} pt="md">
      <Box pos="relative" mb="sm">
        <Avatar src={user?.avatarUrl} name={user?.name} color="initials" size={96}>
          {userInitial(user)}
        </Avatar>
        <Tooltip label={changePhoto}>
          <ActionIcon
            variant="default"
            size={36}
            pos="absolute"
            right={-2}
            bottom={-2}
            aria-label={changePhoto}
            onClick={() => setOpened(true)}
            style={CAMERA}
          >
            <Camera size={18} />
          </ActionIcon>
        </Tooltip>
      </Box>
      <Title order={1} size="h2" ta="center">
        {user?.name || t('settings.unnamedUser')}
      </Title>
      <Text c="dimmed" ta="center">
        {user?.email || user?.phone}
      </Text>
      <AvatarUploadModal
        opened={opened}
        onClose={() => setOpened(false)}
        onUpload={upload}
        isLoading={profile.isLoading}
      />
    </Stack>
  );
}
