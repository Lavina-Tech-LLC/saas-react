import { Button, Stack, Text } from '@mantine/core';
import type { FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';

import type { PhoneOtpChannel } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';
import { AuthCard } from '../ui/AuthCard';
import { CodeInput } from '../ui/CodeInput';
import { TextLink } from '../ui/TextLink';

const SENT_VIA: Record<PhoneOtpChannel, TranslationKey> = {
  sms: 'otp.sentVia.sms',
  telegram: 'otp.sentVia.telegram',
  whatsapp: 'otp.sentVia.whatsapp',
};

interface OtpScreenProps {
  title: string;
  submitLabel: string;
  identifier: string;
  /** Where the code went; null on a server that does not say. */
  channel: PhoneOtpChannel | null;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (e: FormEvent) => void;
  error?: string | null;
  loading: boolean;
  resendAfterSeconds: number;
  /** Sends a new code the same way as the last one. */
  onResend: () => void;
  /** "Get the code another way" — back to the channel choice; omit when there is only one channel. */
  onOtherWay?: () => void;
  onChangeNumber: () => void;
}

// A one-time code sent to a phone number: confirming it for a sign-up, or signing in with it
export function OtpScreen(props: OtpScreenProps) {
  const t = useT();
  const { identifier, channel, code, resendAfterSeconds } = props;
  const subtitle = channel ? t(SENT_VIA[channel], { identifier }) : t('otp.subtitle', { identifier });

  return (
    <AuthCard title={props.title} subtitle={subtitle}>
      {props.error && <AppAlert severity="error">{props.error}</AppAlert>}
      <form onSubmit={props.onSubmit}>
        <Stack gap="md">
          <CodeInput label={t('otp.label')} value={code} onChange={props.onCodeChange} />
          <Button type="submit" fullWidth loading={props.loading} disabled={code.length < 6}>
            {props.submitLabel}
          </Button>
        </Stack>
      </form>
      <Stack gap={4} align="center">
        {resendAfterSeconds > 0 ? (
          <Text fz="sm" c="dimmed">
            {t('otp.resendIn', { seconds: resendAfterSeconds })}
          </Text>
        ) : (
          <TextLink onClick={props.onResend}>{t('otp.resend')}</TextLink>
        )}
        {props.onOtherWay && <TextLink onClick={props.onOtherWay}>{t('phoneCode.otherWay')}</TextLink>}
        <TextLink onClick={props.onChangeNumber}>{t('otp.changeNumber')}</TextLink>
      </Stack>
    </AuthCard>
  );
}
