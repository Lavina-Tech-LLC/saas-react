import { Button } from '@mantine/core';
import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { EmptyState } from '@/components/uiKit/EmptyState';

import type { Member, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { SettingsBlock } from '../../SettingsBlock';
import { EditRolesSheet } from './EditRolesSheet';
import { InviteSheet } from './InviteSheet';
import type { InviteSuccess } from './InviteSuccessBanner';
import { MembersTable } from './MembersTable';

interface MembersCardProps {
  orgId: string;
  assignableRoles: Role[];
  canInviteByEmail: boolean;
  canInviteByPhone: boolean;
  onInviteStart: () => void;
  onInvited: (success: InviteSuccess) => void;
}

// The members, Invite at the heading's end; roles and invites in bottom sheets, removing asks first
export function MembersCard({ orgId, assignableRoles, onInvited, ...invite }: MembersCardProps) {
  const t = useT();
  const { members, removeMember } = useOrg();
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [removePending, setRemovePending] = useState(false);

  const confirmRemove = async () => {
    if (!removing) return;
    setRemovePending(true);
    try {
      if (await removeMember(orgId, removing.userId)) setRemoving(null);
    } finally {
      setRemovePending(false);
    }
  };

  return (
    <SettingsBlock
      title={t('people.members')}
      action={
        <Button leftSection={<UserPlus size={18} />} onClick={() => setInviting(true)}>
          {t('people.invite')}
        </Button>
      }
    >
      {members.length === 0 ? (
        <EmptyState icon={Users} title={t('people.noMembers')} description={t('people.noMembersHint')} />
      ) : (
        <MembersTable members={members} onEdit={setEditing} onRemove={setRemoving} />
      )}
      <InviteSheet
        opened={inviting}
        onClose={() => setInviting(false)}
        orgId={orgId}
        assignableRoles={assignableRoles}
        canInviteByEmail={invite.canInviteByEmail}
        canInviteByPhone={invite.canInviteByPhone}
        onStart={invite.onInviteStart}
        onInvited={(success) => {
          setInviting(false);
          onInvited(success);
        }}
      />
      <EditRolesSheet
        orgId={orgId}
        member={editing}
        assignableRoles={assignableRoles}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        opened={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('people.removeMemberTitle', { member: removing?.email || removing?.phone || '' })}
        description={t('people.removeMemberConfirm')}
        confirmLabel={t('common.remove')}
        loading={removePending}
      />
    </SettingsBlock>
  );
}
