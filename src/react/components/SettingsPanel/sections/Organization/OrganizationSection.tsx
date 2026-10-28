import { Stack } from '@mantine/core';
import { Check, UserCog } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SettingsRow } from '@/components/uiKit/SettingsRow';
import { SECTION_GAP } from '@/styles/spacing';

import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';
import { OrgDeleteRow } from './OrgDeleteRow';
import { OrgHeader } from './OrgHeader';
import { OrgListSection } from './OrgListSection';

interface OrganizationSectionProps {
  onOrgDeleted?: () => void;
  onOrgUpdated?: () => void;
}

// Everyone: their organizations (switch, create). Owners also: the current organization's details and deleting it
export function OrganizationSection({ onOrgDeleted, onOrgUpdated }: OrganizationSectionProps) {
  const t = useT();
  const { selectedOrg } = useOrg();
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [syncedOrgId, setSyncedOrgId] = useState(selectedOrg?.id);
  // Another organization selected: the "deleted" screen and the saved notice go
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

  return (
    <Stack gap={SECTION_GAP}>
      {updated && (
        <AppAlert severity="success" onClose={() => setUpdated(false)}>
          {t('org.updated')}
        </AppAlert>
      )}
      {deleted && <EmptyState icon={Check} color="green" title={t('org.deleted')} description={t('org.deletedHint')} />}
      {!deleted && selectedOrg?.role === 'owner' && (
        <>
          <SettingsGroup title={t('org.currentTitle')}>
            <OrgHeader org={selectedOrg} onUpdated={handleUpdated} />
            <SettingsRow
              icon={UserCog}
              color="indigo"
              label={t('org.yourRole')}
              value={<RoleBadge role={selectedOrg.role} />}
            />
          </SettingsGroup>
          <SettingsGroup>
            <OrgDeleteRow org={selectedOrg} onDeleted={handleDeleted} />
          </SettingsGroup>
        </>
      )}
      <OrgListSection onChanged={onOrgUpdated} />
    </Stack>
  );
}
