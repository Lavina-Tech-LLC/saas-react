import { Button, Group, Paper, Select, Text } from '@mantine/core';
import { Link, Plus } from 'lucide-react';
import { useState } from 'react';

import type { InviteLink, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { ConfirmModal } from '../../../ui/ConfirmModal';
import { SettingsSection } from '../../../ui/SettingsSection';
import { InviteLinksTable } from './InviteLinksTable';

// Reusable invite links: create, copy, revoke
export function InviteLinksCard({ orgId, assignableRoles }: { orgId: string; assignableRoles: Role[] }) {
  const t = useT();
  const { inviteLinks, createInviteLink, revokeInviteLink } = useOrg();
  const [showCreate, setShowCreate] = useState(false);
  const [linkRole, setLinkRole] = useState('member');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<InviteLink | null>(null);
  const [revokePending, setRevokePending] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      if (!(await createInviteLink(orgId, linkRole))) return;
      setShowCreate(false);
      setLinkRole('member');
    } finally {
      setCreating(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revoking) return;
    setRevokePending(true);
    try {
      if (await revokeInviteLink(orgId, revoking.id)) setRevoking(null);
    } finally {
      setRevokePending(false);
    }
  };

  const createButton = (
    <Button size="sm" leftSection={<Plus size={16} />} onClick={() => setShowCreate((v) => !v)}>
      {t('people.createLink')}
    </Button>
  );

  return (
    <SettingsSection title={t('people.inviteLinks')} icon={<Link size={18} />} action={createButton}>
      {showCreate && (
        <Paper p="md" bg="var(--mantine-color-default-hover)">
          <Group align="flex-end" gap="sm">
            <Select
              label={t('common.role')}
              data={assignableRoles.map((r) => ({ value: r.key, label: r.name }))}
              value={linkRole}
              onChange={(value) => value && setLinkRole(value)}
              allowDeselect={false}
              flex={1}
              miw={180}
            />
            <Button onClick={create} loading={creating}>
              {t('common.create')}
            </Button>
          </Group>
        </Paper>
      )}
      {inviteLinks.length === 0 ? (
        <Text fz="sm" c="dimmed">
          {t('people.noInviteLinks')}
        </Text>
      ) : (
        <InviteLinksTable links={inviteLinks} onRevoke={setRevoking} />
      )}
      <ConfirmModal
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('people.revokeLink')}
        confirmLabel={t('common.revoke')}
        loading={revokePending}
      >
        {t('people.revokeLinkConfirm')}
      </ConfirmModal>
    </SettingsSection>
  );
}
