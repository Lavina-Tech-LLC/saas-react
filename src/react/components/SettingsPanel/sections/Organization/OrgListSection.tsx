import { Avatar, Button, ThemeIcon } from '@mantine/core';
import { Building2, Check, Plus } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/uiKit/EmptyState';
import { ListItem } from '@/components/uiKit/List';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';

import { useSaaSContext } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { orgInitials } from '../../../ui/initials';
import { roleLabel } from '../../../ui/RoleBadge';
import { CreateOrgSheet } from './CreateOrgSheet';

// Every organization the user belongs to, as Google's account switcher: the current one checked, any other switched to
// by pressing it, and New organization last when the project allows it
export function OrgListSection({ onChanged }: { onChanged?: () => void }) {
  const { t, settings, user } = useSaaSContext();
  const { orgs, selectedOrg, selectOrg } = useOrg();
  const [creating, setCreating] = useState(false);
  const canCreate = !(settings?.orgCreationPolicy === 'self_registered_only' && user?.source === 'invite');

  const switchTo = async (orgId: string) => {
    await selectOrg(orgId);
    onChanged?.();
  };
  const sheet = <CreateOrgSheet opened={creating} onClose={() => setCreating(false)} onCreated={() => onChanged?.()} />;

  if (orgs.length === 0) {
    return (
      <>
        <EmptyState
          icon={Building2}
          title={t('org.emptyTitle')}
          description={canCreate ? t('org.emptyCanCreate') : t('org.emptyInviteOnly')}
          action={
            canCreate && (
              <Button leftSection={<Plus size={18} />} onClick={() => setCreating(true)}>
                {t('org.new')}
              </Button>
            )
          }
        />
        {sheet}
      </>
    );
  }

  return (
    <>
      <SettingsGroup title={t('org.yours')}>
        {orgs.map((org) => {
          const current = org.id === selectedOrg?.id;
          return (
            <ListItem
              key={org.id}
              leadingType="avatar"
              leading={
                <Avatar src={org.avatarUrl} radius="md" color="initials" name={org.name}>
                  {orgInitials(org.name)}
                </Avatar>
              }
              headline={org.name}
              supportingText={org.role && roleLabel(t, org.role)}
              selected={current}
              trailingText={current ? t('org.current') : undefined}
              trailing={current ? <Check size={20} /> : undefined}
              onClick={current ? undefined : () => switchTo(org.id)}
            />
          );
        })}
        {canCreate && (
          <ListItem
            leadingType="avatar"
            leading={
              <ThemeIcon variant="light" size={40} radius="md">
                <Plus size={20} />
              </ThemeIcon>
            }
            headline={t('org.new')}
            onClick={() => setCreating(true)}
          />
        )}
      </SettingsGroup>
      {sheet}
    </>
  );
}
