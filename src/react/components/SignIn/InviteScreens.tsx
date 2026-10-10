import { Button, Center, Group, Loader, Text } from '@mantine/core';

import { useT } from '../../context';
import { AuthCard } from '../ui/AuthCard';
import { ErrorAlert } from '../ui/ErrorAlert';
import { TextLink } from '../ui/TextLink';
import { formatInviterName } from './inviteUrl';
import type { InviteFlow } from './useInviteFlow';

/** Loading, unavailable, or the accept card — null once the invite needs no screen of its own. */
export function InviteScreens({ invite, onAccept }: { invite: InviteFlow; onAccept: () => void }) {
  const t = useT();
  const { code, info, isLoading, error } = invite;
  if (!code || invite.showSignUp) return null;

  if (!info && (isLoading || !error)) {
    return (
      <AuthCard>
        <Center py="md">
          <Loader size="sm" />
        </Center>
        <Text ta="center" fz="sm" c="dimmed">
          {t('invite.loading')}
        </Text>
      </AuthCard>
    );
  }

  if (!info) {
    return (
      <AuthCard title={t('invite.unavailable')} subtitle={error}>
        <Group justify="center">
          <TextLink onClick={invite.dismiss}>{t('invite.backToSignIn')}</TextLink>
        </Group>
      </AuthCard>
    );
  }

  const acceptLabel = invite.isSignedIn
    ? t('invite.acceptAs', { name: invite.user?.name || invite.user?.email || '' })
    : t('invite.accept');

  return (
    <AuthCard
      title={t('invite.invitesYou', { inviter: formatInviterName(info, t), org: info.orgName })}
      subtitle={t('invite.joinAs', { role: info.roleName || info.role })}
    >
      <ErrorAlert message={invite.acceptError || error} />
      <Button fullWidth loading={invite.isAccepting} disabled={isLoading} onClick={onAccept}>
        {acceptLabel}
      </Button>
      <Group justify="center">
        <TextLink onClick={invite.dismiss}>{t('invite.notNow')}</TextLink>
      </Group>
    </AuthCard>
  );
}
