import { Button, Group, Stack, Text } from '@mantine/core';
import type { FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';

import type { PhoneOtpChannel } from '../../../auth/types';
import type { TranslationKey } from '../../../i18n';
import { useT } from '../../context';
import { AuthActions } from '../ui/AuthActions';
import { AuthCard } from '../ui/AuthCard';
import { CodeInput } from '../ui/CodeInput';
import { IdentityChip } from './IdentityChip';

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

// A one-time code sent to a phone number: confirming it for a sign-up, or signing in with it. The number sits beside
// the form as a chip that changes it; a new code is offered under the boxes once the wait is over
export function OtpScreen(props: OtpScreenProps) {
  const t = useT();
  const { identifier, channel, code, resendAfterSeconds } = props;
  const subtitle = channel ? t(SENT_VIA[channel], { identifier }) : t('otp.subtitle', { identifier });
  return (
    <AuthCard
      title={props.title}
      subtitle={subtitle}
      aside={<IdentityChip identifier={identifier} kind="phone" onChange={props.onChangeNumber} />}
    >
      {props.error && <AppAlert severity="error">{props.error}</AppAlert>}
      <form onSubmit={props.onSubmit}>
        <Stack gap="md">
          <CodeInput label={t('otp.label')} value={code} onChange={props.onCodeChange} />
          <Group mih={28}>
            {resendAfterSeconds > 0 ? (
              <Text fz="sm" c="dimmed">
                {t('otp.resendIn', { seconds: resendAfterSeconds })}
              </Text>
            ) : (
              <Button variant="subtle" size="compact-sm" onClick={props.onResend}>
                {t('otp.resend')}
              </Button>
            )}
          </Group>
          <AuthActions
            start={
              props.onOtherWay && (
                <Button variant="subtle" onClick={props.onOtherWay}>
                  {t('phoneCode.otherWay')}
                </Button>
              )
            }
          >
            <Button type="submit" loading={props.loading} disabled={code.length < 6}>
              {props.submitLabel}
            </Button>
          </AuthActions>
        </Stack>
      </form>
    </AuthCard>
  );
}
