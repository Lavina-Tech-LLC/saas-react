import { ActionIcon, Group, Paper, Table, Tooltip } from '@mantine/core';
import { Send, X } from 'lucide-react';
import { useState } from 'react';

import type { PendingInvite } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { ConfirmModal } from '../../../ui/ConfirmModal';
import { RoleBadge } from '../../../ui/RoleBadge';
import { SettingsSection } from '../../../ui/SettingsSection';
import { useColorVariant } from '../../../ui/useColorVariant';

// Personal invites not accepted yet; hidden when there are none
export function PendingInvitesCard({ orgId }: { orgId: string }) {
  const t = useT();
  const variant = useColorVariant();
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

  return (
    <SettingsSection title={t('people.pendingInvites')} icon={<Send size={18} />}>
      <Paper p={0} withBorder style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={480}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('common.email')}</Table.Th>
                <Table.Th>{t('common.role')}</Table.Th>
                <Table.Th w={1} ta="center">
                  {t('common.actions')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invites.map((invite) => (
                <Table.Tr key={invite.id}>
                  <Table.Td>{invite.email || invite.phone}</Table.Td>
                  <Table.Td>
                    <RoleBadge role={invite.role} label={invite.roleName || invite.role} />
                  </Table.Td>
                  <Table.Td w={1}>
                    <Group justify="center" gap="xs" wrap="nowrap">
                      <Tooltip label={t('people.revokeInvite')} withArrow>
                        <ActionIcon
                          aria-label={t('people.revokeInvite')}
                          variant={variant}
                          size="md"
                          color="red"
                          onClick={() => setRevoking(invite)}
                        >
                          <X size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <ConfirmModal
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('people.revokeInvite')}
        confirmLabel={t('common.revoke')}
        loading={pending}
      >
        {t('people.revokeInviteConfirm', { identifier: revoking?.email || revoking?.phone || '' })}
      </ConfirmModal>
    </SettingsSection>
  );
}
