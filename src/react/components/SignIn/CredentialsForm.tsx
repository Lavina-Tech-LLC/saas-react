import { Button, Group, PasswordInput, Stack } from '@mantine/core';
import { useState, type FormEvent, type ReactNode } from 'react';

import { useT } from '../../context';
import { AuthActions } from '../ui/AuthActions';
import { CodeInput } from '../ui/CodeInput';
import { ChannelStep } from './ChannelStep';
import { IdentifierField, identifierProblem } from './IdentifierField';
import type { SignInFlow } from './useSignInFlow';

export type CredentialStep = 'identifier' | 'channel' | 'password';

interface CredentialsFormProps {
  flow: SignInFlow;
  step: CredentialStep;
  onStepChange: (step: CredentialStep) => void;
  onForgot?: () => void;
  /** At the start of step one's actions: switch between signing in and up, or leave an invite. */
  switchAction?: ReactNode;
  /** Social sign-in, shown under the first step only. */
  social?: ReactNode;
}

// Two steps, one decision each: who you are, then your password, where to send a code (phone) or the MFA code. The
// identity chip that goes back to step one sits beside the form (AuthCard's aside).
export function CredentialsForm({ flow, step, onStepChange, onForgot, switchAction, social }: CredentialsFormProps) {
  const t = useT();
  const { isSignIn, mfaMode, cfg } = flow;
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const idPrefix = isSignIn ? 'ss-signin' : 'ss-signup';
  const submitLabel = mfaMode ? t('signIn.verify') : isSignIn ? t('signIn.submit') : t('signUp.submit');
  const codeAvailable = flow.isPhone && cfg.phoneOtpLoginEnabled;

  const next = (e: FormEvent) => {
    e.preventDefault();
    const problem = identifierProblem(flow.identifier, flow.identifierKind);
    if (problem) return setIdentifierError(t(problem));
    setIdentifierError(null);
    onStepChange(codeAvailable ? 'channel' : 'password');
  };

  const switchTo = (next: CredentialStep) => {
    flow.clearErrors();
    flow.phoneCode.reset();
    onStepChange(next);
  };

  if (step === 'identifier' && !mfaMode) {
    return (
      <Stack gap="lg">
        <form onSubmit={next} noValidate>
          <Stack gap="md">
            <IdentifierField
              id={`${idPrefix}-identifier`}
              kind={flow.identifierKind}
              value={flow.identifier}
              onChange={(value) => {
                flow.setIdentifier(value);
                setIdentifierError(null);
              }}
              onKindChange={flow.setIdentifierKind}
              acceptsBoth={cfg.showIdentifierToggle}
              dialCode={cfg.dialCode}
              error={identifierError}
            />
            <AuthActions start={switchAction}>
              <Button type="submit">{t('signIn.continue')}</Button>
            </AuthActions>
          </Stack>
        </form>
        {social}
      </Stack>
    );
  }

  if (step === 'channel' && !mfaMode) {
    return <ChannelStep flow={flow} onPassword={() => switchTo('password')} />;
  }

  return (
    <form onSubmit={mfaMode || isSignIn ? flow.submitSignIn : flow.submitSignUp}>
      <Stack gap="md">
        {mfaMode ? (
          <CodeInput label={t('mfa.label')} hint={t('mfa.hint')} value={flow.mfaCode} onChange={flow.setMfaCode} />
        ) : (
          <>
            <PasswordInput
              id={`${idPrefix}-password`}
              label={isSignIn ? t('signIn.password') : t('signUp.newPassword')}
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
              value={flow.password}
              onChange={(e) => {
                flow.setPassword(e.currentTarget.value);
                flow.setValidationError(null);
              }}
              required
              autoFocus
            />
            {!isSignIn && (
              <PasswordInput
                label={t('signIn.passwordConfirm')}
                autoComplete="new-password"
                value={flow.confirmPassword}
                onChange={(e) => {
                  flow.setConfirmPassword(e.currentTarget.value);
                  flow.setValidationError(null);
                }}
                required
              />
            )}
            {codeAvailable && (
              <Group>
                <Button variant="subtle" size="compact-sm" onClick={() => switchTo('channel')}>
                  {t('phoneCode.useCode')}
                </Button>
              </Group>
            )}
          </>
        )}
        <AuthActions
          start={
            isSignIn &&
            !mfaMode &&
            onForgot && (
              <Button variant="subtle" onClick={onForgot}>
                {t('signIn.forgot')}
              </Button>
            )
          }
        >
          <Button type="submit" loading={flow.isLoading} disabled={mfaMode && flow.mfaCode.length < 6}>
            {submitLabel}
          </Button>
        </AuthActions>
      </Stack>
    </form>
  );
}
