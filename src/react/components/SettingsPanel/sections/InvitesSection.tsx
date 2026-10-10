import { Avatar, Button, Center, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { Mail } from 'lucide-react';
import { useState } from 'react';

import { useT } from '../../../context';
import { useInvites } from '../../../hooks/useInvites';
import { useOrg } from '../../../hooks/useOrg';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorAlert } from '../../ui/ErrorAlert';
import { orgInitials } from '../../ui/initials';
import { RoleBadge } from '../../ui/RoleBadge';
import { SettingsGroup } from '../../ui/SettingsGroup';

// Pending invitations addressed to the current user
export function InvitesSection() {
  const t = useT();
  const { invites, isLoading, error, setError, accept, decline } = useInvites();
  const { refresh } = useOrg();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setError(null);
    setActionLoading(id);
    const result = await accept(id);
    if (result) await refresh();
    setActionLoading(null);
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    await decline(id);
    setActionLoading(null);
  };

  let content;
  if (isLoading) {
    content = (
      <Center py="xl">
        <Loader size={32} />
      </Center>
    );
  } else if (invites.length === 0) {
    content = <EmptyState icon={<Mail size={24} />}>{t('invites.none')}</EmptyState>;
  } else {
    // One group of rows (LM3 §13), one row per invitation: who invites you, as what, until when — then the choice
    content = (
      <SettingsGroup>
        {invites.map((invite) => {
          const busy = actionLoading === invite.id;
          return (
            <Group key={invite.id} px="md" py="sm" gap="md" justify="space-between">
              <Group gap="sm" wrap="nowrap" miw={0} flex={1}>
                <Avatar radius="md" color="initials" name={invite.orgName}>
                  {orgInitials(invite.orgName)}
                </Avatar>
                <Stack gap={4} miw={0}>
                  <Text fw={600} truncate>
                    {invite.orgName}
                  </Text>
                  <Group gap="xs">
                    <RoleBadge role={invite.role} label={invite.roleName} />
                    <Text fz="xs" c="dimmed">
                      {t('invites.expiresOn', { date: new Date(invite.expiresAt).toLocaleDateString() })}
                    </Text>
                  </Group>
                </Stack>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Button variant="default" size="xs" onClick={() => handleDecline(invite.id)} disabled={busy}>
                  {t('common.decline')}
                </Button>
                <Button size="xs" onClick={() => handleAccept(invite.id)} loading={busy}>
                  {t('common.accept')}
                </Button>
              </Group>
            </Group>
          );
        })}
      </SettingsGroup>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={4}>{t('invites.title')}</Title>
      <ErrorAlert message={error} />
      {content}
    </Stack>
  );
}
