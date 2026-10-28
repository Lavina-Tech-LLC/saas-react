import { Button, Checkbox, Stack, Text } from '@mantine/core';
import { useState } from 'react';

import { BottomSheet } from '@/components/uiKit/Sheets';

import type { Member, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';

interface EditRolesSheetProps {
  orgId: string;
  member: Member | null;
  assignableRoles: Role[];
  onClose: () => void;
}

const initialRoles = (member: Member | null) => member?.roles?.map((r) => r.key) ?? (member ? [member.role] : []);

// One member's roles, picked in a bottom sheet (LM3 §20); Save stays off until at least one is picked
export function EditRolesSheet({ orgId, member, assignableRoles, onClose }: EditRolesSheetProps) {
  const t = useT();
  const { updateMemberRoles } = useOrg();
  const [roles, setRoles] = useState<string[]>(() => initialRoles(member));
  const [shownFor, setShownFor] = useState(member);
  const [pending, setPending] = useState(false);
  // A different member opened: start from their roles
  if (member !== shownFor) {
    setShownFor(member);
    if (member) setRoles(initialRoles(member));
  }

  const save = async () => {
    if (!member) return;
    setPending(true);
    try {
      if (await updateMemberRoles(orgId, member.userId, roles)) onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <BottomSheet
      opened={member !== null}
      onClose={onClose}
      title={t('people.editRoles')}
      actions={
        <>
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} loading={pending} disabled={roles.length === 0}>
            {t('common.saveShort')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          {t('people.changeRolesFor', { member: member?.email || member?.phone || '' })}
        </Text>
        <Checkbox.Group label={t('common.roles')} value={roles} onChange={setRoles}>
          <Stack gap="sm" mt="xs">
            {assignableRoles.map((r) => (
              <Checkbox key={r.key} value={r.key} label={<RoleBadge role={r.key} label={r.name} />} />
            ))}
          </Stack>
        </Checkbox.Group>
      </Stack>
    </BottomSheet>
  );
}
