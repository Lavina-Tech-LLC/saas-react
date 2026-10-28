import { Avatar, Badge, Button } from '@mantine/core';
import { Building2, Plus } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/uiKit/EmptyState';
import { ListItem } from '@/components/uiKit/List';
import { SegmentedList } from '@/components/uiKit/SegmentedList';

import { useSaaSContext } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { orgInitials } from '../../../ui/initials';
import { RoleBadge } from '../../../ui/RoleBadge';
import { SettingsBlock } from '../../SettingsBlock';
import { CreateOrgSheet } from './CreateOrgSheet';

// Every organization the user belongs to, one tile each: the current one marked, Switch on the others; New
// organization when the project allows it
export function OrgListSection({ onChanged }: { onChanged?: () => void }) {
  const { t, settings, user } = useSaaSContext();
  const { orgs, selectedOrg, selectOrg } = useOrg();
  const [creating, setCreating] = useState(false);
  const canCreate = !(settings?.orgCreationPolicy === 'self_registered_only' && user?.source === 'invite');

  const switchTo = async (orgId: string) => {
    await selectOrg(orgId);
    onChanged?.();
  };

  return (
    <SettingsBlock
      title={t('org.yours')}
      action={
        canCreate && (
          <Button variant="light" leftSection={<Plus size={18} />} onClick={() => setCreating(true)}>
            {t('org.new')}
          </Button>
        )
      }
    >
      {orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('org.emptyTitle')}
          description={canCreate ? t('org.emptyCanCreate') : t('org.emptyInviteOnly')}
        />
      ) : (
        <SegmentedList aria-label={t('org.yours')}>
          {orgs.map((org) => (
            <ListItem
              key={org.id}
              leadingType="avatar"
              leading={
                <Avatar src={org.avatarUrl} radius="md" color="initials" name={org.name}>
                  {orgInitials(org.name)}
                </Avatar>
              }
              headline={org.name}
              supportingText={org.role && <RoleBadge role={org.role} />}
              selected={org.id === selectedOrg?.id}
              trailing={
                org.id === selectedOrg?.id ? (
                  <Badge variant="light" color="green">
                    {t('org.current')}
                  </Badge>
                ) : (
                  <Button variant="default" onClick={() => switchTo(org.id)}>
                    {t('org.switch')}
                  </Button>
                )
              }
            />
          ))}
        </SegmentedList>
      )}
      <CreateOrgSheet opened={creating} onClose={() => setCreating(false)} onCreated={() => onChanged?.()} />
    </SettingsBlock>
  );
}
