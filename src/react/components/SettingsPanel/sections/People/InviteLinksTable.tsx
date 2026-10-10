import { ActionIcon, CopyButton, Group, Paper, Table, Text, Tooltip } from '@mantine/core';
import { Check, Copy, X } from 'lucide-react';

import type { InviteLink } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';
import { useColorVariant } from '../../../ui/useColorVariant';

export function InviteLinksTable({ links, onRevoke }: { links: InviteLink[]; onRevoke: (link: InviteLink) => void }) {
  const t = useT();
  const variant = useColorVariant();
  const { getInviteLinkUrl } = useOrg();

  return (
    <Paper p={0} withBorder style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={720}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('people.link')}</Table.Th>
              <Table.Th>{t('common.role')}</Table.Th>
              <Table.Th ta="right">{t('people.uses')}</Table.Th>
              <Table.Th>{t('people.expires')}</Table.Th>
              <Table.Th w={1} ta="center">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {links.map((link) => (
              <Table.Tr key={link.id}>
                <Table.Td>
                  <Text ff="monospace" fz="xs" c="dimmed">
                    {`…${link.code.slice(-12)}`}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <RoleBadge role={link.role} label={link.roleName || link.role} />
                </Table.Td>
                <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {link.maxUses > 0 ? `${link.useCount}/${link.maxUses}` : link.useCount}
                </Table.Td>
                <Table.Td>
                  <Text fz="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(link.expiresAt).toLocaleString()}
                  </Text>
                </Table.Td>
                <Table.Td w={1}>
                  <Group justify="center" gap="xs" wrap="nowrap">
                    <CopyButton value={getInviteLinkUrl(link)} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? t('common.copied') : t('people.copyInviteLink')} withArrow>
                          <ActionIcon
                            aria-label={t('people.copyInviteLink')}
                            variant={variant}
                            size="md"
                            color={copied ? 'green' : undefined}
                            onClick={copy}
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    <Tooltip label={t('people.revokeLink')} withArrow>
                      <ActionIcon
                        aria-label={t('people.revokeLink')}
                        variant={variant}
                        size="md"
                        color="red"
                        onClick={() => onRevoke(link)}
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
  );
}
