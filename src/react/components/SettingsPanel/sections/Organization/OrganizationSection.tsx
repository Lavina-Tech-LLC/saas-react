import { Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Check, UserCog } from 'lucide-react';
import { useState } from 'react';

import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';
import { SettingsGroup } from '../../../ui/SettingsGroup';
import { SettingsRow } from '../../../ui/SettingsRow';
import { SettingsSection } from '../../../ui/SettingsSection';
import { SuccessAlert } from '../../../ui/SuccessAlert';
import { OrgDeleteRow } from './OrgDeleteRow';
import { OrgHeader } from './OrgHeader';
import { OrgListSection } from './OrgListSection';

interface OrganizationSectionProps {
  onOrgDeleted?: () => void;
  onOrgUpdated?: () => void;
}

// Everyone: their organizations (switch, create). Owners also: the current organization's details and deletion
export function OrganizationSection({ onOrgDeleted, onOrgUpdated }: OrganizationSectionProps) {
  const t = useT();
  const { selectedOrg } = useOrg();
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [syncedOrgId, setSyncedOrgId] = useState(selectedOrg?.id);

  // A newly selected org clears the "deleted" screen and the saved notice
  if (selectedOrg && selectedOrg.id !== syncedOrgId) {
    setSyncedOrgId(selectedOrg.id);
    setDeleted(false);
    setUpdated(false);
  }

  const handleUpdated = () => {
    setUpdated(true);
    onOrgUpdated?.();
  };

  const handleDeleted = () => {
    setDeleted(true);
    onOrgDeleted?.();
  };

  let body = null;
  if (deleted) {
    body = (
      <Paper p="xl" withBorder ta="center">
        <Stack align="center" gap="xs">
          <ThemeIcon size={56} radius="xl" color="green" variant="light">
            <Check size={32} />
          </ThemeIcon>
          <Title order={5}>{t('org.deleted')}</Title>
          <Text fz="sm" c="dimmed">
            {t('org.deletedHint')}
          </Text>
        </Stack>
      </Paper>
    );
  } else if (selectedOrg?.role === 'owner') {
    // Only owners change or delete the current organization; everyone else sees the list alone
    body = (
      <SettingsSection title={t('org.currentTitle')}>
        <SuccessAlert>{updated && t('org.updated')}</SuccessAlert>
        <SettingsGroup>
          <OrgHeader org={selectedOrg} onUpdated={handleUpdated} />
          {selectedOrg.role && (
            <SettingsRow
              icon={UserCog}
              color="indigo"
              label={t('org.yourRole')}
              value={<RoleBadge role={selectedOrg.role} />}
            />
          )}
        </SettingsGroup>
        <SettingsGroup>
          <OrgDeleteRow org={selectedOrg} onDeleted={handleDeleted} />
        </SettingsGroup>
      </SettingsSection>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={4}>{t('org.title')}</Title>
      <OrgListSection onChanged={onOrgUpdated} />
      {body}
    </Stack>
  );
}
