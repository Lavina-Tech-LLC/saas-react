import { CreditCard } from 'lucide-react';

import { EmptyState } from '@/components/uiKit/EmptyState';
import { ListItem } from '@/components/uiKit/List';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';

import { useT } from '../../../context';
import { useOrg } from '../../../hooks/useOrg';

// Owner only: the organization's plan as a settings row, until billing actions are wired up
export function BillingSection() {
  const t = useT();
  const { selectedOrg } = useOrg();
  if (!selectedOrg) {
    return <EmptyState icon={CreditCard} title={t('people.noOrgTitle')} description={t('settings.selectOrgBilling')} />;
  }
  return (
    <SettingsGroup>
      <ListItem
        leading={<CreditCard />}
        headline={t('org.plan')}
        supportingText={selectedOrg.planName || t('billing.none')}
        wrapText
      />
    </SettingsGroup>
  );
}
