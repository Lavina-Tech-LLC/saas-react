import { Button, Stack, TextInput } from '@mantine/core';
import { ChevronRight, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { ListItem } from '@/components/uiKit/List';
import { BottomSheet } from '@/components/uiKit/Sheets';

import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { useProfile } from '../../../../hooks/useProfile';

const FORM = 'saas-profile-name';

// The name row; pressing it opens the name in a bottom sheet
export function NameRow({ onSaved }: { onSaved: (notice: TranslationKey) => void }) {
  const t = useT();
  const { user } = useAuth();
  const profile = useProfile();
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');

  const open = () => {
    setName(user?.name ?? '');
    profile.setError(null);
    setOpened(true);
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await profile.updateProfile({ name, avatarUrl: user?.avatarUrl || undefined }))) return;
    setOpened(false);
    onSaved('settings.profileSaved');
  };

  return (
    <>
      <ListItem
        leading={<UserRound />}
        headline={t('common.name')}
        supportingText={user?.name || t('common.notSet')}
        trailing={<ChevronRight size={20} />}
        onClick={open}
      />
      <BottomSheet
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('settings.editName')}
        actions={
          <>
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form={FORM} loading={profile.isLoading}>
              {t('common.saveShort')}
            </Button>
          </>
        }
      >
        <Stack component="form" id={FORM} onSubmit={save} gap="md">
          {profile.error && <AppAlert severity="error">{profile.error}</AppAlert>}
          <TextInput
            label={t('settings.fullName')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            data-autofocus
          />
        </Stack>
      </BottomSheet>
    </>
  );
}
