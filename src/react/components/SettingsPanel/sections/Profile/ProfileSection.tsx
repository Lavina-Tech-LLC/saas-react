import { Stack } from '@mantine/core';
import { LogIn, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { SettingsGroup } from '@/components/uiKit/SettingsGroup';
import { SettingsRow } from '@/components/uiKit/SettingsRow';
import { SECTION_GAP } from '@/styles/spacing';

import type { TranslationKey } from '../../../../../i18n';
import { useSaaSContext } from '../../../../context';
import { useAuth } from '../../../../hooks/useAuth';
import { DeleteAccountRow } from './DeleteAccountRow';
import { FaceRow } from './FaceRow';
import { PasswordRow } from './PasswordRow';
import { ProfileHeader } from './ProfileHeader';

const PROVIDERS: Record<string, TranslationKey> = {
  email: 'provider.email',
  phone: 'provider.phone',
  google: 'provider.google',
  github: 'provider.github',
};

// LM3 §13 — the account's settings: who you are, how you sign in, then deleting the account on its own at the end
export function ProfileSection({ afterDeleteAccountUrl }: { afterDeleteAccountUrl?: string }) {
  const { t, settings } = useSaaSContext();
  const { user } = useAuth();
  const [notice, setNotice] = useState<TranslationKey | null>(null);
  const hasPassword = user?.provider === 'email' || user?.provider === 'phone';
  const faceMode = settings?.faceVerificationMode ?? 'off';
  const provider = user?.provider && PROVIDERS[user.provider];

  return (
    <Stack gap={SECTION_GAP}>
      {notice && (
        <AppAlert severity="success" onClose={() => setNotice(null)}>
          {t(notice)}
        </AppAlert>
      )}
      <SettingsGroup>
        <ProfileHeader onSaved={setNotice} />
        <SettingsRow icon={Mail} color="teal" label={t('identifier.email')} value={user?.email || t('common.notSet')} />
        <SettingsRow
          icon={Phone}
          color="green"
          label={t('identifier.phone')}
          value={user?.phone || t('common.notSet')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.group.security')}>
        <SettingsRow
          icon={LogIn}
          color="violet"
          label={t('settings.authProvider')}
          value={provider ? t(provider) : (user?.provider ?? t('common.notSet'))}
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
