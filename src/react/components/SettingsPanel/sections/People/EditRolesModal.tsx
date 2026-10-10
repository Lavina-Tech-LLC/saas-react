import { Box, Button, Checkbox, em, Group, Modal, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';

import type { Member, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';

interface EditRolesModalProps {
  orgId: string;
  member: Member | null;
  assignableRoles: Role[];
  onClose: () => void;
}

const initialRoles = (member: Member | null) => member?.roles?.map((r) => r.key) ?? (member ? [member.role] : []);

// Multi-role assignment for one member
export function EditRolesModal({ orgId, member, assignableRoles, onClose }: EditRolesModalProps) {
  const t = useT();
  const { updateMemberRoles } = useOrg();
  const [editRoles, setEditRoles] = useState<string[]>(() => initialRoles(member));
  const [shownFor, setShownFor] = useState(member);
  const [pending, setPending] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${em(767)})`);

  // Reset the selection whenever a different member is opened
  if (member !== shownFor) {
    setShownFor(member);
    if (member) setEditRoles(initialRoles(member));
  }

  const save = async () => {
    if (!member) return;
    setPending(true);
    try {
      if (await updateMemberRoles(orgId, member.userId, editRoles)) onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal opened={member !== null} onClose={onClose} title={t('people.editRoles')} fullScreen={isMobile}>
      <Box p="md">
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            {t('people.changeRolesFor', { member: member?.email || member?.phone || '' })}
          </Text>
          <Checkbox.Group label={t('common.roles')} value={editRoles} onChange={setEditRoles}>
            <Stack gap="xs" mt="xs">
              {assignableRoles.map((r) => (
                <Checkbox key={r.key} value={r.key} label={<RoleBadge role={r.key} label={r.name} />} />
              ))}
            </Stack>
          </Checkbox.Group>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={save} loading={pending} disabled={editRoles.length === 0}>
              {t('common.saveShort')}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
