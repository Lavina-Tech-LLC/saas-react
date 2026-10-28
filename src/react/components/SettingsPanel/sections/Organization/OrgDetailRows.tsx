import { Avatar, Button, Group, Stack, TextInput } from '@mantine/core';
import { Building2, ChevronRight, ImageIcon, Link2, UserCog } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { ListItem } from '@/components/uiKit/List';
import { BottomSheet } from '@/components/uiKit/Sheets';

import type { Org } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { AvatarUploadModal } from '../../../AvatarUpload/AvatarUploadModal';
import { orgInitials } from '../../../ui/initials';
import { roleLabel } from '../../../ui/RoleBadge';

const FORM = 'saas-rename-org';

// The organization's rows, as Google's personal info: its name (renamed in a bottom sheet), its logo (the cropper),
// its address and your role
export function OrgDetailRows({ org, onUpdated }: { org: Org; onUpdated: () => void }) {
  const t = useT();
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
    <>
      <ListItem
        leading={<Building2 />}
        headline={t('common.name')}
        supportingText={org.name}
        trailing={<ChevronRight size={20} />}
        onClick={() => open('name')}
      />
      <ListItem
        leading={<ImageIcon />}
        headline={t('org.logo')}
        supportingText={t('org.logoHint')}
        wrapText
        trailing={
          <Group gap="sm" wrap="nowrap">
            <Avatar src={org.avatarUrl} radius="md" color="initials" name={org.name}>
              {orgInitials(org.name)}
            </Avatar>
            <ChevronRight size={20} />
          </Group>
        }
        onClick={() => open('logo')}
      />
      <ListItem leading={<Link2 />} headline={t('org.address')} supportingText={org.slug} />
      {org.role && (
        <ListItem leading={<UserCog />} headline={t('org.yourRole')} supportingText={roleLabel(t, org.role)} />
      )}
      <BottomSheet
        opened={dialog === 'name'}
        onClose={() => setDialog(null)}
        title={t('org.rename')}
        actions={
          <>
            <Button variant="default" onClick={() => setDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form={FORM} loading={busy} disabled={!name.trim() || name.trim() === org.name}>
              {t('common.saveShort')}
            </Button>
          </>
        }
      >
        <Stack component="form" id={FORM} onSubmit={rename} gap="md">
          {error && <AppAlert severity="error">{error}</AppAlert>}
          <TextInput
            label={t('org.name')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            data-autofocus
          />
        </Stack>
      </BottomSheet>
      <AvatarUploadModal
        opened={dialog === 'logo'}
        onClose={() => setDialog(null)}
        onUpload={uploadLogo}
        isLoading={busy}
        uploadError={dialog === 'logo' ? error : null}
      />
    </>
  );
}
