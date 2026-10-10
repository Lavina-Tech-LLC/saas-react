import { ActionIcon, Badge, Group, Paper, Table, Text, Tooltip } from '@mantine/core';
import { Trash2 } from 'lucide-react';

import type { ApiKey } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useColorVariant } from '../../../ui/useColorVariant';

/** Locale date, or an em dash when missing or invalid. */
export function formatKeyDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export function ApiKeysTable({ keys, onRevoke }: { keys: ApiKey[]; onRevoke: (key: ApiKey) => void }) {
  const t = useT();
  const variant = useColorVariant();
  const dash = '—';

  return (
    <Paper p={0} withBorder style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={720}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('apiKeys.prefix')}</Table.Th>
              <Table.Th>{t('common.roles')}</Table.Th>
              <Table.Th>{t('people.expires')}</Table.Th>
              <Table.Th>{t('apiKeys.lastUsed')}</Table.Th>
              <Table.Th w={1} ta="center">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {keys.map((key) => (
              <Table.Tr key={key.id}>
                <Table.Td>
                  <Text>{key.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text ff="monospace" fz="xs">
                    {key.keyPrefix}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {key.roles.length > 0 ? (
                    <Group gap={4}>
                      {key.roles.map((r) => (
                        <Badge key={r.id} size="md" variant={variant} color="gray">
                          {r.name}
                        </Badge>
                      ))}
                    </Group>
                  ) : (
                    <Text fz="sm" c="dimmed">
                      {dash}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text fz="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {key.expiresAt ? formatKeyDate(key.expiresAt) : t('common.never')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fz="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {formatKeyDate(key.lastUsedAt)}
                  </Text>
                </Table.Td>
                <Table.Td w={1}>
                  <Group justify="center" gap="xs" wrap="nowrap">
                    <Tooltip label={t('apiKeys.revoke')} withArrow>
                      <ActionIcon
                        aria-label={t('apiKeys.revoke')}
                        variant={variant}
                        size="md"
                        color="red"
                        onClick={() => onRevoke(key)}
                      >
                        <Trash2 size={16} />
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
  );
}
