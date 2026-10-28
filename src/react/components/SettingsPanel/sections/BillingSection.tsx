import { CreditCard } from 'lucide-react';

import { EmptyState } from '@/components/uiKit/EmptyState';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SettingsRow } from '@/components/uiKit/SettingsRow';

import { useT } from '../../../context';
import { useOrg } from '../../../hooks/useOrg';

// Owner only: the organization's plan as a settings tile, until billing actions are wired up
export function BillingSection() {
  const t = useT();
  const { selectedOrg } = useOrg();
  if (!selectedOrg) {
    return <EmptyState icon={CreditCard} title={t('people.noOrgTitle')} description={t('settings.selectOrgBilling')} />;
  }
  return (
    <SettingsGroup>
      <SettingsRow
        icon={CreditCard}
        color="pink"
        label={t('billing.planTitle')}
        description={t('billing.none')}
        value={selectedOrg.planName || t('common.notSet')}
      />
    </SettingsGroup>
  );
}
