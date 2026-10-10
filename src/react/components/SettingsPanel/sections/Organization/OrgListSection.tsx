import { Avatar, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { Building2, Plus } from 'lucide-react';
import { useState } from 'react';

import { useSaaSContext } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { EmptyState } from '../../../ui/EmptyState';
import { orgInitials } from '../../../ui/initials';
import { SettingsGroup } from '../../../ui/SettingsGroup';
import { SettingsSection } from '../../../ui/SettingsSection';
import { useColorVariant } from '../../../ui/useColorVariant';
import { CreateOrgModal } from './CreateOrgModal';

// Every organization the user belongs to: which one is current, switch, and create a new one (when the project allows)
export function OrgListSection({ onChanged }: { onChanged?: () => void }) {
  const { t, settings, user } = useSaaSContext();
  const colorVariant = useColorVariant();
  const { orgs, selectedOrg, selectOrg } = useOrg();
  const [creating, setCreating] = useState(false);
  const canCreate = !(settings?.orgCreationPolicy === 'self_registered_only' && user?.source === 'invite');

  const switchTo = async (orgId: string) => {
    await selectOrg(orgId);
    onChanged?.();
  };

  return (
    <SettingsSection
      title={t('org.yours')}
      action={
        canCreate && (
          <Button size="xs" variant={colorVariant} leftSection={<Plus size={14} />} onClick={() => setCreating(true)}>
            {t('org.new')}
          </Button>
        )
      }
    >
      {orgs.length === 0 ? (
        <EmptyState icon={<Building2 size={24} />}>
          {canCreate ? t('org.emptyCanCreate') : t('org.emptyInviteOnly')}
        </EmptyState>
      ) : (
        <SettingsGroup>
          {orgs.map((org) => {
            const current = org.id === selectedOrg?.id;
            return (
              <Group key={org.id} px="md" py="sm" gap="md" justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <Avatar src={org.avatarUrl} radius="md" color="initials" name={org.name}>
                    {orgInitials(org.name)}
                  </Avatar>
                  <Stack gap={0} miw={0}>
                    <Text fw={600} truncate>
                      {org.name}
                    </Text>
                    {org.role && (
                      <Text fz="xs" c="dimmed" tt="capitalize">
                        {org.role}
                      </Text>
                    )}
                  </Stack>
                </Group>
                {current ? (
                  <Badge variant={colorVariant} color="green">
                    {t('org.current')}
                  </Badge>
                ) : (
                  <Button size="xs" variant="default" onClick={() => switchTo(org.id)}>
                    {t('org.switch')}
                  </Button>
                )}
              </Group>
            );
          })}
        </SettingsGroup>
      )}
      <CreateOrgModal opened={creating} onClose={() => setCreating(false)} onCreated={() => onChanged?.()} />
    </SettingsSection>
  );
}
