import { Button, Text } from '@mantine/core';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

import type { Member, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { ConfirmModal } from '../../../ui/ConfirmModal';
import { SettingsSection } from '../../../ui/SettingsSection';
import { EditRolesModal } from './EditRolesModal';
import { InviteForm } from './InviteForm';
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

export function MembersCard({
  orgId,
  assignableRoles,
  canInviteByEmail,
  canInviteByPhone,
  onInviteStart,
  onInvited,
}: MembersCardProps) {
  const t = useT();
  const { members, removeMember } = useOrg();
  const [showInvite, setShowInvite] = useState(false);
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

  const invited = (success: InviteSuccess) => {
    setShowInvite(false);
    onInvited(success);
  };

  const inviteButton = (
    <Button size="sm" leftSection={<Plus size={16} />} onClick={() => setShowInvite((v) => !v)}>
      {t('people.invite')}
    </Button>
  );

  return (
    <SettingsSection title={t('people.members')} icon={<Users size={18} />} action={inviteButton}>
      {showInvite && (
        <InviteForm
          orgId={orgId}
          assignableRoles={assignableRoles}
          canInviteByEmail={canInviteByEmail}
          canInviteByPhone={canInviteByPhone}
          onStart={onInviteStart}
          onInvited={invited}
        />
      )}
      {members.length === 0 ? (
        <Text fz="sm" c="dimmed">
          {t('people.noMembers')}
        </Text>
      ) : (
        <MembersTable members={members} onEdit={setEditing} onRemove={setRemoving} />
      )}
      <EditRolesModal
        orgId={orgId}
        member={editing}
        assignableRoles={assignableRoles}
        onClose={() => setEditing(null)}
      />
      <ConfirmModal
        opened={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('people.removeMemberTitle')}
        confirmLabel={t('common.remove')}
        loading={removePending}
      >
        {t('people.removeMemberConfirm', { member: removing?.email || removing?.phone || '' })}
      </ConfirmModal>
    </SettingsSection>
  );
}
