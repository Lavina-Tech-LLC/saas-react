import { Stack } from '@mantine/core';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SECTION_GAP } from '@/styles/spacing';

import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { OrgDeleteRow } from './OrgDeleteRow';
import { OrgDetailRows } from './OrgDetailRows';
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

  const owner = !deleted && selectedOrg?.role === 'owner' ? selectedOrg : null;

  return (
    <Stack gap={SECTION_GAP}>
      {updated && (
        <AppAlert severity="success" onClose={() => setUpdated(false)}>
          {t('org.updated')}
        </AppAlert>
      )}
      {deleted && <EmptyState icon={Check} color="green" title={t('org.deleted')} description={t('org.deletedHint')} />}
      {owner && (
        <SettingsGroup title={t('org.currentTitle')}>
          <OrgDetailRows org={owner} onUpdated={handleUpdated} />
        </SettingsGroup>
      )}
      <OrgListSection onChanged={onOrgUpdated} />
      {/* Deleting goes last, on its own */}
      {owner && (
        <SettingsGroup>
          <OrgDeleteRow org={owner} onDeleted={handleDeleted} />
        </SettingsGroup>
      )}
    </Stack>
  );
}
