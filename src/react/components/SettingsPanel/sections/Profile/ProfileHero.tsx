import { ActionIcon, Avatar, Box, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Camera } from 'lucide-react';
import { useState } from 'react';

import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { userInitial } from '../../../ui/initials';

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
            radius="xl"
            size="lg"
            pos="absolute"
            right={-4}
            bottom={-4}
            aria-label={changePhoto}
            onClick={() => setOpened(true)}
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
