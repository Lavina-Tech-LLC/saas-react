import { ThemeIcon } from '@mantine/core';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { ListItem } from '@/components/uiKit/List';
import { RelativeTime } from '@/components/uiKit/RelativeTime';
import { SegmentedList } from '@/components/uiKit/SegmentedList';
import { TableActions } from '@/components/uiKit/TableActions';

import type { PendingInvite } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';
import { SettingsBlock } from '../../SettingsBlock';

// Personal invites not accepted yet, one tile each (who, the role, when it was sent); hidden when there are none
export function PendingInvitesCard({ orgId }: { orgId: string }) {
  const t = useT();
  const { invites, revokeInvite } = useOrg();
  const [revoking, setRevoking] = useState<PendingInvite | null>(null);
  const [pending, setPending] = useState(false);
  if (invites.length === 0) return null;

  const confirmRevoke = async () => {
    if (!revoking) return;
    setPending(true);
    try {
      if (await revokeInvite(orgId, revoking.id)) setRevoking(null);
    } finally {
      setPending(false);
    }
  };
  const revoke = t('people.revokeInvite');

  return (
    <SettingsBlock title={t('people.pendingInvites')}>
      <SegmentedList aria-label={t('people.pendingInvites')}>
        {invites.map((invite) => (
          <ListItem
            key={invite.id}
            leadingType="avatar"
            leading={
              <ThemeIcon variant="light" color="violet">
                <Mail />
              </ThemeIcon>
            }
            headline={invite.email || invite.phone}
            supportingText={<RelativeTime value={invite.createdAt} />}
            trailing={
              <>
                <RoleBadge role={invite.role} label={invite.roleName || invite.role} />
                <TableActions
                  name={invite.email || invite.phone || ''}
                  actions={[
                    { key: 'revoke', label: revoke, icon: X, destructive: true, onClick: () => setRevoking(invite) },
                  ]}
                />
              </>
            }
          />
        ))}
      </SegmentedList>
      <ConfirmDialog
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('people.revokeInviteTitle', { identifier: revoking?.email || revoking?.phone || '' })}
        description={t('people.revokeInviteConfirm')}
        confirmLabel={t('common.revoke')}
        loading={pending}
      />
    </SettingsBlock>
  );
}
