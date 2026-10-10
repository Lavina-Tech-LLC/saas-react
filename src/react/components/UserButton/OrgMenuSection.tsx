import { Avatar, Group, Menu, Text } from '@mantine/core';
import { Building2, Check } from 'lucide-react';

import type { Org } from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { useOrg } from '../../hooks/useOrg';
import { orgInitials } from '../ui/initials';

interface OrgMenuSectionProps {
  onSelect: (org: Org) => void;
  /** Opens Settings on the Organization tab — the list, switching and creating live there. */
  onManage: () => void;
  onOrgSettingsClick?: (org: Org) => void;
}

// Organization switcher and a way into Settings → Organization (creating one happens there, not in the menu)
export function OrgMenuSection({ onSelect, onManage, onOrgSettingsClick }: OrgMenuSectionProps) {
  const { t } = useSaaSContext();
  const { orgs, selectedOrg } = useOrg();

  return (
    <>
      <Menu.Label>{t('org.section')}</Menu.Label>
      {orgs.map((org) => {
        const active = selectedOrg?.id === org.id;
        return (
          <Menu.Item
            key={org.id}
            onClick={() => onSelect(org)}
            leftSection={
              <Avatar size="sm" radius="md" color="initials" name={org.name} src={org.avatarUrl}>
                {orgInitials(org.name)}
              </Avatar>
            }
            rightSection={
              <Group gap={6} wrap="nowrap">
                {org.role && (
                  <Text fz="xs" c="dimmed" tt="capitalize">
                    {org.role}
                  </Text>
                )}
                {active && <Check size={14} color="var(--mantine-primary-color-filled)" />}
              </Group>
            }
          >
            <Text fz="sm" fw={active ? 600 : 500} truncate>
              {org.name}
            </Text>
          </Menu.Item>
        );
      })}
      <Menu.Item leftSection={<Building2 size={14} />} onClick={onManage}>
        {t('org.manage')}
      </Menu.Item>
      {selectedOrg && onOrgSettingsClick && (
        <Menu.Item leftSection={<Building2 size={14} />} onClick={() => onOrgSettingsClick(selectedOrg)}>
          {t('org.settings')}
        </Menu.Item>
      )}
    </>
  );
}
