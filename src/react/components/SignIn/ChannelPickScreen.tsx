import { Group } from '@mantine/core';

import { AppAlert } from '@/components/uiKit/AppAlert';

import type { PhoneOtpChannel } from '../../../auth/types';
import { useT } from '../../context';
import { AuthCard } from '../ui/AuthCard';
import { TextLink } from '../ui/TextLink';
import { ChannelButtons } from './ChannelButtons';

interface ChannelPickScreenProps {
  identifier: string;
  channels: PhoneOtpChannel[];
  loading: boolean;
  error?: string | null;
  onSelect: (channel: PhoneOtpChannel) => void;
  onBack: () => void;
}

// Confirming the number of a phone sign-up when the project can send the code more than one way
export function ChannelPickScreen({ identifier, channels, loading, error, onSelect, onBack }: ChannelPickScreenProps) {
  const t = useT();
  return (
    <AuthCard title={t('otp.title')} subtitle={t('otp.pickSubtitle', { identifier })}>
      {error && <AppAlert severity="error">{error}</AppAlert>}
      <ChannelButtons channels={channels} loading={loading} onSelect={onSelect} />
      <Group justify="center">
        <TextLink onClick={onBack}>{t('otp.changeNumber')}</TextLink>
      </Group>
    </AuthCard>
  );
}
