import { Button, Center, Loader, Text } from '@mantine/core';

import { AppAlert } from '@/components/uiKit/AppAlert';

import { useT } from '../../context';
import { AuthActions } from '../ui/AuthActions';
import { AuthCard } from '../ui/AuthCard';
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
        <AuthActions>
          <Button onClick={invite.dismiss}>{t('invite.backToSignIn')}</Button>
        </AuthActions>
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
      {(invite.acceptError || error) && <AppAlert severity="error">{invite.acceptError || error}</AppAlert>}
      <AuthActions
        start={
          <Button variant="subtle" onClick={invite.dismiss}>
            {t('invite.notNow')}
          </Button>
        }
      >
        <Button loading={invite.isAccepting} disabled={isLoading} onClick={onAccept}>
          {acceptLabel}
        </Button>
      </AuthActions>
    </AuthCard>
  );
}
