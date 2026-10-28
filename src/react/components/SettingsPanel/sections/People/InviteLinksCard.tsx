import { Button, Select } from '@mantine/core';
import { Link, Plus } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { BottomSheet } from '@/components/uiKit/Sheets';

import type { InviteLink, Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import { SettingsBlock } from '../../SettingsBlock';
import { InviteLinksTable } from './InviteLinksTable';

// Reusable invite links: Create link (its role picked in a bottom sheet), copy, revoke
export function InviteLinksCard({ orgId, assignableRoles }: { orgId: string; assignableRoles: Role[] }) {
  const t = useT();
  const { inviteLinks, createInviteLink, revokeInviteLink } = useOrg();
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [linkRole, setLinkRole] = useState('member');
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<InviteLink | null>(null);
  const [revokePending, setRevokePending] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      if (!(await createInviteLink(orgId, linkRole))) return;
      setCreatingOpen(false);
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

  return (
    <SettingsBlock
      title={t('people.inviteLinks')}
      action={
        <Button variant="light" leftSection={<Plus size={18} />} onClick={() => setCreatingOpen(true)}>
          {t('people.createLink')}
        </Button>
      }
    >
      {inviteLinks.length === 0 ? (
        <EmptyState icon={Link} title={t('people.noInviteLinks')} description={t('people.noInviteLinksHint')} />
      ) : (
        <InviteLinksTable links={inviteLinks} onRevoke={setRevoking} />
      )}
      <BottomSheet
        opened={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        title={t('people.createLink')}
        actions={
          <>
            <Button variant="default" onClick={() => setCreatingOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={create} loading={creating}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <Select
          label={t('common.role')}
          data={assignableRoles.map((r) => ({ value: r.key, label: r.name }))}
          value={linkRole}
          onChange={(value) => value && setLinkRole(value)}
          allowDeselect={false}
        />
      </BottomSheet>
      <ConfirmDialog
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('people.revokeLinkTitle')}
        description={t('people.revokeLinkConfirm')}
        confirmLabel={t('common.revoke')}
        loading={revokePending}
      />
    </SettingsBlock>
  );
}
