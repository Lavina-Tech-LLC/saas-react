import { Avatar, Group, Menu, Text } from '@mantine/core';
import { Building2, Check, Settings2 } from 'lucide-react';

import type { Org } from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { useOrg } from '../../hooks/useOrg';
import { orgInitials } from '../ui/initials';
import { roleLabel } from '../ui/RoleBadge';

interface OrgMenuSectionProps {
  onSelect: (org: Org) => void;
  /** Opens Settings on the Organization tab — the list, switching and creating live there. */
  onManage: () => void;
  onOrgSettingsClick?: (org: Org) => void;
}

// LM3 §21 — the organization switcher (the current one ✓) and a way into Settings → Organization, where they are
// created
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
                  <Text fz="sm" c="dimmed">
                    {roleLabel(t, org.role)}
                  </Text>
                )}
                {active && <Check size={20} color="var(--m3-indicator)" />}
              </Group>
            }
          >
            <Text fz="sm" fw={active ? 600 : 500} truncate>
              {org.name}
            </Text>
          </Menu.Item>
        );
      })}
      <Menu.Item leftSection={<Building2 size={20} />} onClick={onManage}>
        {t('org.manage')}
      </Menu.Item>
      {selectedOrg && onOrgSettingsClick && (
        <Menu.Item leftSection={<Settings2 size={20} />} onClick={() => onOrgSettingsClick(selectedOrg)}>
          {t('org.settings')}
        </Menu.Item>
      )}
    </>
  );
}
