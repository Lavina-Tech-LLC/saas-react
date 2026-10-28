import { Avatar, Badge, Button, Stack, TextInput, UnstyledButton } from '@mantine/core';
import { BadgeCheck, Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { AppModal } from '@/components/uiKit/AppModal';
import { ListItem } from '@/components/uiKit/List';

import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { userInitial } from '../../../ui/initials';

const NAME_FORM = 'saas-profile-name';

// The profile's first tile: who you are. The avatar opens the cropper, Edit the name dialog.
export function ProfileHeader({ onSaved }: { onSaved: (notice: TranslationKey) => void }) {
  const t = useT();
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
    <>
      <ListItem
        leadingType="avatar"
        leading={
          <UnstyledButton onClick={() => setDialog('avatar')} aria-label={t('settings.changeAvatar')}>
            <Avatar src={user?.avatarUrl} name={user?.name} color="initials">
              {userInitial(user)}
            </Avatar>
          </UnstyledButton>
        }
        headline={user?.name || t('settings.unnamedUser')}
        supportingText={user?.email || user?.phone}
        trailing={
          <>
            {verified && (
              <Badge color="green" variant="light" leftSection={<BadgeCheck size={14} />}>
                {t('common.verified')}
              </Badge>
            )}
            <Button variant="light" leftSection={<Pencil size={16} />} onClick={openName}>
              {t('common.edit')}
            </Button>
          </>
        }
      />
      <AppModal
        opened={dialog === 'name'}
        onClose={() => setDialog(null)}
        title={t('settings.editName')}
        size="md"
        mainAction={{ label: t('common.saveShort'), form: NAME_FORM, loading: profile.isLoading }}
      >
        <Stack component="form" id={NAME_FORM} onSubmit={saveName} gap="md">
          {profile.error && <AppAlert severity="error">{profile.error}</AppAlert>}
          <TextInput
            label={t('settings.fullName')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            data-autofocus
          />
        </Stack>
      </AppModal>
      <AvatarUploadModal
        opened={dialog === 'avatar'}
        onClose={() => setDialog(null)}
        onUpload={uploadAvatar}
        isLoading={profile.isLoading}
      />
    </>
  );
}
