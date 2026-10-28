import { Button, Stack } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';

import type { IdentifierKind } from '../../../auth/identifier';
import type { PhoneOtpChannel } from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { usePhoneOtp } from '../../hooks/usePhoneOtp';
import { AuthActions } from '../ui/AuthActions';
import { AuthCard } from '../ui/AuthCard';
import { CodeInput } from '../ui/CodeInput';
import { ChannelButtons } from './ChannelButtons';
import { IdentifierField } from './IdentifierField';
import { checkNewPassword, NewPasswordFields } from './NewPasswordFields';
import { channelProblem, needsChannelChoice, onlyChannel } from './otpChannels';
import type { SignInSettings } from './signInSettings';

type Step = 'request' | 'phoneCode' | 'emailSent' | 'done';

interface ForgotPasswordProps {
  cfg: SignInSettings;
  initialKind: IdentifierKind;
  initialIdentifier: string;
  onBack: () => void;
}

// Email accounts get a reset link; phone accounts confirm a code (SMS or messenger) and choose a new password here
export function ForgotPassword({ cfg, initialKind, initialIdentifier, onBack }: ForgotPasswordProps) {
  const { t, locale } = useSaaSContext();
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
  // Several channels: their buttons take the place of "Send code"
  const pickChannel = isPhone && needsChannelChoice(cfg.phoneOtpChannels);
  const error = localError || reset.error || phoneOtp.error;

  const sendCode = async (channel?: PhoneOtpChannel) => {
    setLocalError(null);
    const outcome = await phoneOtp.send(identifier, 'reset', { channel, locale });
    const problem = channelProblem(outcome, channel);
    if (problem) setLocalError(t(problem));
    if (outcome.status === 'sent') setStep('phoneCode');
    if (outcome.status === 'unavailable') setLocalError(t('forgot.smsUnavailable'));
  };

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!isPhone) {
      if (await reset.sendEmailLink(identifier, window.location.href)) setStep('emailSent');
      return;
    }
    // With channel buttons on screen, Enter in the field waits for a pick
    if (!pickChannel) await sendCode(onlyChannel(cfg.phoneOtpChannels));
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
    <Button variant="subtle" onClick={onBack}>
      {t('forgot.back')}
    </Button>
  );

  if (step === 'emailSent' || step === 'done') {
    return (
      <AuthCard title={t('forgot.title')}>
        <AppAlert severity="success">
          {step === 'done' ? t('forgot.done') : t('forgot.linkSent', { identifier })}
        </AppAlert>
        {/* The one way on from here, filled */}
        <AuthActions>
          <Button onClick={onBack}>{t('forgot.back')}</Button>
        </AuthActions>
      </AuthCard>
    );
  }

  if (step === 'phoneCode') {
    return (
      <AuthCard title={t('forgot.title')} subtitle={t('forgot.codeSubtitle', { identifier })}>
        {error && <AppAlert severity="error">{error}</AppAlert>}
        <form onSubmit={confirmPhone}>
          <Stack gap="md">
            <CodeInput label={t('otp.label')} value={code} onChange={setCode} />
            <NewPasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
            />
            <AuthActions start={back}>
              <Button type="submit" loading={reset.isLoading || phoneOtp.isLoading} disabled={code.length < 6}>
                {t('forgot.submit')}
              </Button>
            </AuthActions>
          </Stack>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('forgot.title')} subtitle={isPhone ? t('forgot.phoneSubtitle') : t('forgot.emailSubtitle')}>
      {error && <AppAlert severity="error">{error}</AppAlert>}
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
          {pickChannel && (
            <ChannelButtons
              channels={cfg.phoneOtpChannels ?? []}
              loading={phoneOtp.isLoading}
              onSelect={(channel) => void sendCode(channel)}
            />
          )}
          {/* With channel rows on screen, they are the way on */}
          <AuthActions start={back}>
            {!pickChannel && (
              <Button type="submit" loading={reset.isLoading || phoneOtp.isLoading}>
                {isPhone ? t('forgot.sendCode') : t('forgot.sendLink')}
              </Button>
            )}
          </AuthActions>
        </Stack>
      </form>
    </AuthCard>
  );
}
