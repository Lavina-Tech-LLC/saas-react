import { Group, Paper, Table } from '@mantine/core';
import { Pencil, UserMinus } from 'lucide-react';

import { CellText } from '@/components/uiKit/CellText';
import { ACTION_COLOR, TableActions } from '@/components/uiKit/TableActions';
import { TableScroll } from '@/components/uiKit/TableScroll';

import type { Member } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { RoleBadge } from '../../../ui/RoleBadge';
import { FLAT_CARD } from '../../flatCard';

interface MembersTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
}

// LM3 §14 — the members: who, their roles, and (not for the owner) Edit roles and Remove
export function MembersTable({ members, onEdit, onRemove }: MembersTableProps) {
  const t = useT();
  return (
    <Paper p={0} {...FLAT_CARD}>
      <TableScroll minWidth={480} label={t('people.members')}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('people.member')}</Table.Th>
              <Table.Th>{t('common.roles')}</Table.Th>
              <Table.Th w={1} ta="end">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map((member) => {
              const name = member.email || member.phone || '';
              return (
                <Table.Tr key={member.userId}>
                  <Table.Td>
                    <CellText fw={600}>{name}</CellText>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {member.roles?.length ? (
                        member.roles.map((r) => <RoleBadge key={r.key} role={r.key} label={r.name} />)
                      ) : (
                        <RoleBadge role={member.role} label={member.roleName || member.role} />
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td data-row-controls>
                    {member.role !== 'owner' && (
                      <TableActions
                        name={name}
                        actions={[
                          {
                            key: 'roles',
                            label: t('people.editRole'),
                            icon: Pencil,
                            color: ACTION_COLOR.edit,
                            onClick: () => onEdit(member),
                          },
                          {
                            key: 'remove',
                            label: t('people.removeMember'),
                            icon: UserMinus,
                            destructive: true,
                            onClick: () => onRemove(member),
                          },
                        ]}
                      />
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </TableScroll>
    </Paper>
  );
}
