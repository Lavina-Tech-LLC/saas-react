import { Button, Group, Stack, Text } from '@mantine/core';

import { useT } from '../../context';
import { AuthCard } from '../ui/AuthCard';
import { CodeInput } from '../ui/CodeInput';
import { ErrorAlert } from '../ui/ErrorAlert';
import { TextLink } from '../ui/TextLink';
import type { SignInFlow } from './useSignInFlow';

// SMS confirmation of a phone number during sign-up
export function OtpScreen({ flow }: { flow: SignInFlow }) {
  const t = useT();
  const { phoneOtp } = flow;

  return (
    <AuthCard title={t('otp.title')} subtitle={t('otp.subtitle', { identifier: flow.identifier })}>
      <ErrorAlert message={flow.otpError} />
      <form onSubmit={flow.submitOtp}>
        <Stack gap="md">
          <CodeInput label={t('otp.label')} value={flow.otpCode} onChange={flow.setOtpCode} />
          <Button type="submit" fullWidth loading={flow.isLoading} disabled={flow.otpCode.length < 6}>
            {t('otp.submit')}
          </Button>
        </Stack>
      </form>
      <Stack gap={4} align="center">
        {phoneOtp.resendAfterSeconds > 0 ? (
          <Text fz="sm" c="dimmed">
            {t('otp.resendIn', { seconds: phoneOtp.resendAfterSeconds })}
          </Text>
        ) : (
          <TextLink onClick={() => void phoneOtp.send(flow.identifier, 'register')}>{t('otp.resend')}</TextLink>
        )}
        <Group>
          <TextLink onClick={flow.leaveOtp}>{t('otp.changeNumber')}</TextLink>
        </Group>
      </Stack>
    </AuthCard>
  );
}
