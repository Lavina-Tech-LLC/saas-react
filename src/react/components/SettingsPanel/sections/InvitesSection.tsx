import { Avatar, Button, Center, Group, Loader, Stack } from '@mantine/core';
import { Mail } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { ListItem } from '@/components/uiKit/List';
import { RelativeTime } from '@/components/uiKit/RelativeTime';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SECTION_GAP } from '@/styles/spacing';

import { useT } from '../../../context';
import { useInvites } from '../../../hooks/useInvites';
import { useOrg } from '../../../hooks/useOrg';
import { orgInitials } from '../../ui/initials';
import { RoleBadge } from '../../ui/RoleBadge';

// Invitations addressed to the user: one tile each — who invites you, as what, until when — then Decline or Accept
export function InvitesSection() {
  const t = useT();
  const { invites, isLoading, error, setError, accept, decline } = useInvites();
  const { refresh } = useOrg();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setError(null);
    setBusyId(id);
    if (await accept(id)) await refresh();
    setBusyId(null);
  };
  const handleDecline = async (id: string) => {
    setBusyId(id);
    await decline(id);
    setBusyId(null);
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }
  return (
    <Stack gap={SECTION_GAP}>
      {error && <AppAlert severity="error">{error}</AppAlert>}
      {invites.length === 0 ? (
        <EmptyState icon={Mail} title={t('invites.noneTitle')} description={t('invites.none')} />
      ) : (
        <SettingsGroup>
          {invites.map((invite) => {
            const busy = busyId === invite.id;
            return (
              <ListItem
                key={invite.id}
                leadingType="avatar"
                leading={
                  <Avatar color="initials" name={invite.orgName}>
                    {orgInitials(invite.orgName)}
                  </Avatar>
                }
                headline={invite.orgName}
                supportingText={
                  <Group component="span" gap="xs">
                    <RoleBadge role={invite.role} label={invite.roleName} />
                    <span>
                      {t('invites.expires')} <RelativeTime value={invite.expiresAt} />
                    </span>
                  </Group>
                }
                trailing={
                  <>
                    <Button variant="default" onClick={() => handleDecline(invite.id)} disabled={busy}>
                      {t('common.decline')}
                    </Button>
                    <Button onClick={() => handleAccept(invite.id)} loading={busy}>
                      {t('common.accept')}
                    </Button>
                  </>
                }
              />
            );
          })}
        </SettingsGroup>
      )}
    </Stack>
  );
}
