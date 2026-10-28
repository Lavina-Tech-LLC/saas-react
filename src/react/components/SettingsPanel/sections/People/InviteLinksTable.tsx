import { Paper, Table, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';

import { CellSubtext } from '@/components/uiKit/CellText';
import { RelativeTime } from '@/components/uiKit/RelativeTime';
import { ACTION_COLOR, TableActions } from '@/components/uiKit/TableActions';
import { TableScroll } from '@/components/uiKit/TableScroll';

import type { InviteLink } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { RoleBadge } from '../../../ui/RoleBadge';

// LM3 §14 — the invite links: the link's end, its role, uses, when it expires; Copy and Revoke
export function InviteLinksTable({ links, onRevoke }: { links: InviteLink[]; onRevoke: (link: InviteLink) => void }) {
  const t = useT();
  const { getInviteLinkUrl } = useOrg();
  const clipboard = useClipboard({ timeout: 2000 });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (link: InviteLink) => {
    clipboard.copy(getInviteLinkUrl(link));
    setCopiedId(link.id);
  };

  return (
    <Paper p={0}>
      <TableScroll minWidth={600} label={t('people.inviteLinks')}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('people.link')}</Table.Th>
              <Table.Th>{t('common.role')}</Table.Th>
              <Table.Th ta="end">{t('people.uses')}</Table.Th>
              <Table.Th>{t('people.expires')}</Table.Th>
              <Table.Th w={1} ta="end">
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {links.map((link) => {
              const copied = clipboard.copied && copiedId === link.id;
              return (
                <Table.Tr key={link.id}>
                  <Table.Td>
                    <CellSubtext ff="monospace">{`…${link.code.slice(-12)}`}</CellSubtext>
                  </Table.Td>
                  <Table.Td>
                    <RoleBadge role={link.role} label={link.roleName || link.role} />
                  </Table.Td>
                  <Table.Td ta="end">
                    <Text inherit>{link.maxUses > 0 ? `${link.useCount}/${link.maxUses}` : link.useCount}</Text>
                  </Table.Td>
                  <Table.Td>
                    <RelativeTime value={link.expiresAt} />
                  </Table.Td>
                  <Table.Td data-row-controls>
                    <TableActions
                      name={`…${link.code.slice(-12)}`}
                      actions={[
                        {
                          key: 'copy',
                          label: copied ? t('common.copied') : t('people.copyInviteLink'),
                          icon: copied ? Check : Copy,
                          color: copied ? 'green' : ACTION_COLOR.duplicate,
                          onClick: () => copy(link),
                        },
                        {
                          key: 'revoke',
                          label: t('people.revokeLink'),
                          icon: X,
                          destructive: true,
                          onClick: () => onRevoke(link),
                        },
                      ]}
                    />
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
