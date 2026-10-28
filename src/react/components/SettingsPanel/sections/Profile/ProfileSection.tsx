import { Badge, Stack } from '@mantine/core';
import { LogIn, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { ListItem } from '@/components/uiKit/List';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SECTION_GAP } from '@/styles/spacing';

import type { TranslationKey } from '../../../../../i18n';
import { useSaaSContext } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { DeleteAccountRow } from './DeleteAccountRow';
import { FaceRow } from './FaceRow';
import { NameRow } from './NameRow';
import { PasswordRow } from './PasswordRow';
import { ProfileHero } from './ProfileHero';

const PROVIDERS: Record<string, TranslationKey> = {
  email: 'provider.email',
  phone: 'provider.phone',
  google: 'provider.google',
  github: 'provider.github',
};

// The account, as on myaccount.google.com: the person on top, then personal info, how you sign in, and deleting the
// account on its own at the end — every row opens what changes it
export function ProfileSection({ afterDeleteAccountUrl }: { afterDeleteAccountUrl?: string }) {
  const { t, settings } = useSaaSContext();
  const { user } = useAuth();
  const [notice, setNotice] = useState<TranslationKey | null>(null);
  const hasPassword = user?.provider === 'email' || user?.provider === 'phone';
  const faceMode = settings?.faceVerificationMode ?? 'off';
  const provider = user?.provider && PROVIDERS[user.provider];

  const verified = (yes?: boolean) =>
    yes ? (
      <Badge variant="light" color="green">
        {t('common.verified')}
      </Badge>
    ) : undefined;

  return (
    <Stack gap={SECTION_GAP}>
      <ProfileHero onSaved={setNotice} />
      {notice && (
        <AppAlert severity="success" onClose={() => setNotice(null)}>
          {t(notice)}
        </AppAlert>
      )}
      <SettingsGroup title={t('settings.group.personal')}>
        <NameRow onSaved={setNotice} />
        <ListItem
          leading={<Mail />}
          headline={t('identifier.email')}
          supportingText={user?.email || t('common.notSet')}
          trailing={verified(user?.email ? user.emailVerified : false)}
        />
        <ListItem
          leading={<Phone />}
          headline={t('identifier.phone')}
          supportingText={user?.phone || t('common.notSet')}
          trailing={verified(user?.phone ? user.phoneVerified : false)}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.group.security')}>
        <ListItem
          leading={<LogIn />}
          headline={t('settings.authProvider')}
          supportingText={provider ? t(provider) : (user?.provider ?? t('common.notSet'))}
        />
        {hasPassword && <PasswordRow onChanged={() => setNotice('settings.passwordChanged')} />}
        {faceMode !== 'off' && <FaceRow />}
      </SettingsGroup>
      <SettingsGroup>
        <DeleteAccountRow afterDeleteAccountUrl={afterDeleteAccountUrl} />
      </SettingsGroup>
    </Stack>
  );
}
