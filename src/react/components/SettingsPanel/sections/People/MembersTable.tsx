import { ActionIcon, Group, Paper, Table, Text, Tooltip } from '@mantine/core';
import { Pencil, UserMinus } from 'lucide-react';

import type { Member } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { RoleBadge } from '../../../ui/RoleBadge';
import { useColorVariant } from '../../../ui/useColorVariant';

interface MembersTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export function MembersTable({ members, onEdit, onRemove }: MembersTableProps) {
  const t = useT();
  const variant = useColorVariant();

  return (
    <Paper p={0} withBorder style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={480}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.email')}</Table.Th>
              <Table.Th>{t('common.roles')}</Table.Th>
              <Table.Th w={1} ta="center">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map((member) => (
              <Table.Tr key={member.userId}>
                <Table.Td>{member.email || member.phone}</Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {member.roles?.length ? (
                      member.roles.map((r) => <RoleBadge key={r.key} role={r.key} label={r.name} />)
                    ) : (
                      <RoleBadge role={member.role} label={member.roleName || member.role} />
                    )}
                  </Group>
                </Table.Td>
                <Table.Td w={1}>
                  <Group justify="center" gap="xs" wrap="nowrap">
                    {member.role === 'owner' ? (
                      <Text fz="sm" c="dimmed">
                        {'—'}
                      </Text>
                    ) : (
                      <>
                        <Tooltip label={t('people.editRole')} withArrow>
                          <ActionIcon
                            aria-label={t('people.editRole')}
                            variant={variant}
                            size="md"
                            onClick={() => onEdit(member)}
                          >
                            <Pencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('people.removeMember')} withArrow>
                          <ActionIcon
                            aria-label={t('people.removeMember')}
                            variant={variant}
                            size="md"
                            color="red"
                            onClick={() => onRemove(member)}
                          >
                            <UserMinus size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
