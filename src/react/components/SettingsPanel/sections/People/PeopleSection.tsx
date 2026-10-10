import { Stack, Title } from '@mantine/core';
import { Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useSaaSContext } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { EmptyState } from '../../../ui/EmptyState';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { InviteLinksCard } from './InviteLinksCard';
import { InviteSuccessBanner, type InviteSuccess } from './InviteSuccessBanner';
import { MembersCard } from './MembersCard';
import { PendingInvitesCard } from './PendingInvitesCard';

// Members, pending invites and invite links of the selected organization
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
    return (
      <Stack gap="lg">
        <Title order={4}>{t('people.title')}</Title>
        <EmptyState icon={<Users size={24} />}>{t('settings.selectOrgMembers')}</EmptyState>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={4}>{t('people.title')}</Title>
      <ErrorAlert message={error} />
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
