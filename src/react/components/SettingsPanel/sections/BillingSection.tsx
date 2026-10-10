import { Stack, Title } from '@mantine/core';
import { CreditCard } from 'lucide-react';

import { useT } from '../../../context';
import { useOrg } from '../../../hooks/useOrg';
import { EmptyState } from '../../ui/EmptyState';
import { SettingsGroup } from '../../ui/SettingsGroup';
import { SettingsRow } from '../../ui/SettingsRow';

// Owner-only: the organization's plan as a settings row, until billing actions are wired up
export function BillingSection() {
  const t = useT();
  const { selectedOrg } = useOrg();

  return (
    <Stack gap="lg">
      <Title order={4}>{t('billing.title')}</Title>
      {selectedOrg ? (
        <SettingsGroup>
          <SettingsRow
            icon={CreditCard}
            color="pink"
            label={t('billing.planTitle')}
            description={t('billing.none')}
            value={selectedOrg.planName || t('common.notSet')}
          />
        </SettingsGroup>
      ) : (
        <EmptyState icon={<CreditCard size={24} />}>{t('settings.selectOrgBilling')}</EmptyState>
      )}
    </Stack>
  );
}
