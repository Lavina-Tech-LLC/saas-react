import { Stack } from '@mantine/core';
import { Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { SECTION_GAP } from '@/styles/spacing';

import { useSaaSContext } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { InviteLinksCard } from './InviteLinksCard';
import { InviteSuccessBanner, type InviteSuccess } from './InviteSuccessBanner';
import { MembersCard } from './MembersCard';
import { PendingInvitesCard } from './PendingInvitesCard';

// The selected organization's members, the invites not yet accepted, and its invite links
export function PeopleSection() {
  const { t, settings } = useSaaSContext();
  const { selectedOrg, roles, error, refreshMembers, refreshInvites, refreshInviteLinks } = useOrg();
  const [inviteSuccess, setInviteSuccess] = useState<InviteSuccess | null>(null);
  const canInviteByEmail = settings?.emailAuthEnabled ?? settings?.emailEnabled ?? true;
  const canInviteByPhone = settings?.phoneAuthEnabled ?? false;
  const assignableRoles = useMemo(() => roles.filter((r) => r.key !== 'owner'), [roles]);
  const orgId = selectedOrg?.id;

  useEffect(() => {
    if (!orgId) return;
    void refreshMembers(orgId);
    void refreshInvites(orgId);
    void refreshInviteLinks(orgId);
  }, [orgId, refreshMembers, refreshInvites, refreshInviteLinks]);

  if (!orgId) {
    return <EmptyState icon={Users} title={t('people.noOrgTitle')} description={t('settings.selectOrgMembers')} />;
  }

  return (
    <Stack gap={SECTION_GAP}>
      {error && <AppAlert severity="error">{error}</AppAlert>}
      {inviteSuccess && <InviteSuccessBanner success={inviteSuccess} onDismiss={() => setInviteSuccess(null)} />}
      <MembersCard
        orgId={orgId}
        assignableRoles={assignableRoles}
        canInviteByEmail={canInviteByEmail}
        canInviteByPhone={canInviteByPhone}
        onInviteStart={() => setInviteSuccess(null)}
        onInvited={setInviteSuccess}
      />
      <PendingInvitesCard orgId={orgId} />
      <InviteLinksCard orgId={orgId} assignableRoles={assignableRoles} />
    </Stack>
  );
}
