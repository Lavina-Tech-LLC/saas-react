import { Badge, Group, Paper, Table } from '@mantine/core';
import { Trash2 } from 'lucide-react';

import { CellSubtext, CellText } from '@/components/uiKit/CellText';
import { RelativeTime } from '@/components/uiKit/RelativeTime';
import { TableActions } from '@/components/uiKit/TableActions';
import { TableScroll } from '@/components/uiKit/TableScroll';

import type { ApiKey } from '../../../../../auth/types';
import { useT } from '../../../../context';

// LM3 §14 — the organization's API keys: name and prefix, roles, expiry, last use; Revoke
export function ApiKeysTable({ keys, onRevoke }: { keys: ApiKey[]; onRevoke: (key: ApiKey) => void }) {
  const t = useT();
  const none = '—';
  return (
    <Paper p={0}>
      <TableScroll minWidth={600} label={t('apiKeys.yours')}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('common.roles')}</Table.Th>
              <Table.Th>{t('people.expires')}</Table.Th>
              <Table.Th>{t('apiKeys.lastUsed')}</Table.Th>
              <Table.Th w={1} ta="end">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {keys.map((key) => (
              <Table.Tr key={key.id}>
                <Table.Td>
                  <CellText fw={600}>{key.name}</CellText>
                  <CellSubtext ff="monospace">{`${key.keyPrefix}…`}</CellSubtext>
                </Table.Td>
                <Table.Td>
                  {key.roles.length > 0 ? (
                    <Group gap={4}>
                      {key.roles.map((r) => (
                        <Badge key={r.id} variant="light" color="gray">
                          {r.name}
                        </Badge>
                      ))}
                    </Group>
                  ) : (
                    <CellSubtext>{none}</CellSubtext>
                  )}
                </Table.Td>
                <Table.Td>
                  {key.expiresAt ? (
                    <RelativeTime value={key.expiresAt} />
                  ) : (
                    <CellSubtext>{t('common.never')}</CellSubtext>
                  )}
                </Table.Td>
                <Table.Td>
                  {key.lastUsedAt ? <RelativeTime value={key.lastUsedAt} /> : <CellSubtext>{none}</CellSubtext>}
                </Table.Td>
                <Table.Td data-row-controls>
                  <TableActions
                    name={key.name}
                    actions={[
                      {
                        key: 'revoke',
                        label: t('apiKeys.revoke'),
                        icon: Trash2,
                        destructive: true,
                        onClick: () => onRevoke(key),
                      },
                    ]}
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </TableScroll>
    </Paper>
  );
}
