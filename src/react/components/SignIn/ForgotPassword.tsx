import { Button, Group, Stack } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import type { IdentifierKind } from '../../../auth/identifier';
import { useT } from '../../context';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { usePhoneOtp } from '../../hooks/usePhoneOtp';
import { AuthCard } from '../ui/AuthCard';
import { CodeInput } from '../ui/CodeInput';
import { ErrorAlert } from '../ui/ErrorAlert';
import { SuccessAlert } from '../ui/SuccessAlert';
import { TextLink } from '../ui/TextLink';
import { IdentifierField } from './IdentifierField';
import { checkNewPassword, NewPasswordFields } from './NewPasswordFields';
import type { SignInSettings } from './signInSettings';

type Step = 'request' | 'phoneCode' | 'emailSent' | 'done';

interface ForgotPasswordProps {
  cfg: SignInSettings;
  initialKind: IdentifierKind;
  initialIdentifier: string;
  onBack: () => void;
}

// Email accounts get a reset link; phone accounts confirm an SMS code and choose a new password here
export function ForgotPassword({ cfg, initialKind, initialIdentifier, onBack }: ForgotPasswordProps) {
  const t = useT();
  const reset = usePasswordReset();
  const phoneOtp = usePhoneOtp();
  const [kind, setKind] = useState<IdentifierKind>(initialKind);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [step, setStep] = useState<Step>('request');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const isPhone = kind === 'phone';
  const error = localError || reset.error || phoneOtp.error;

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!isPhone) {
      if (await reset.sendEmailLink(identifier, window.location.href)) setStep('emailSent');
      return;
    }
    const outcome = await phoneOtp.send(identifier, 'reset');
    if (outcome.status === 'sent') setStep('phoneCode');
    if (outcome.status === 'unavailable') setLocalError(t('forgot.smsUnavailable'));
  };

  const confirmPhone = async (e: FormEvent) => {
    e.preventDefault();
    const problem = checkNewPassword(password, confirm, cfg.passwordMinLength, t);
    setLocalError(problem);
    if (problem) return;
    const verified = await phoneOtp.verify(identifier, code, 'reset');
    if (verified && (await reset.resetByPhone(identifier, verified.otpToken, password))) setStep('done');
  };

  const back = (
    <Group justify="center">
      <TextLink onClick={onBack}>{t('forgot.back')}</TextLink>
    </Group>
  );

  if (step === 'emailSent' || step === 'done') {
    return (
      <AuthCard title={t('forgot.title')}>
        <SuccessAlert>{step === 'done' ? t('forgot.done') : t('forgot.linkSent', { identifier })}</SuccessAlert>
        {back}
      </AuthCard>
    );
  }

  if (step === 'phoneCode') {
    return (
      <AuthCard title={t('forgot.title')} subtitle={t('forgot.codeSubtitle', { identifier })}>
        <ErrorAlert message={error} />
        <form onSubmit={confirmPhone}>
          <Stack gap="md">
            <CodeInput label={t('otp.label')} value={code} onChange={setCode} />
            <NewPasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
            />
            <Button type="submit" fullWidth loading={reset.isLoading || phoneOtp.isLoading} disabled={code.length < 6}>
              {t('forgot.submit')}
            </Button>
          </Stack>
        </form>
        {back}
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('forgot.title')} subtitle={isPhone ? t('forgot.phoneSubtitle') : t('forgot.emailSubtitle')}>
      <ErrorAlert message={error} />
      <form onSubmit={request}>
        <Stack gap="md">
          <IdentifierField
            id="ss-forgot-identifier"
            kind={kind}
            value={identifier}
            onChange={setIdentifier}
            onKindChange={setKind}
            acceptsBoth={cfg.showIdentifierToggle}
            dialCode={cfg.dialCode}
          />
          <Button type="submit" fullWidth loading={reset.isLoading || phoneOtp.isLoading}>
            {isPhone ? t('forgot.sendCode') : t('forgot.sendLink')}
          </Button>
        </Stack>
      </form>
      {back}
    </AuthCard>
  );
}
