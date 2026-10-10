import { Button, Group, PasswordInput, Stack } from '@mantine/core';
import { useState, type FormEvent, type ReactNode } from 'react';

import { useT } from '../../context';
import { CodeInput } from '../ui/CodeInput';
import { TextLink } from '../ui/TextLink';
import { IdentifierField, identifierProblem } from './IdentifierField';
import { IdentityChip } from './IdentityChip';
import type { SignInFlow } from './useSignInFlow';

export type CredentialStep = 'identifier' | 'password';

interface CredentialsFormProps {
  flow: SignInFlow;
  step: CredentialStep;
  onStepChange: (step: CredentialStep) => void;
  onForgot?: () => void;
  /** Social sign-in, shown under the first step only. */
  social?: ReactNode;
}

// Two steps, one decision each: who you are, then your password (or the MFA code)
export function CredentialsForm({ flow, step, onStepChange, onForgot, social }: CredentialsFormProps) {
  const t = useT();
  const { isSignIn, mfaMode, cfg } = flow;
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const idPrefix = isSignIn ? 'ss-signin' : 'ss-signup';
  const submitLabel = mfaMode ? t('signIn.verify') : isSignIn ? t('signIn.submit') : t('signUp.submit');

  const next = (e: FormEvent) => {
    e.preventDefault();
    const problem = identifierProblem(flow.identifier, flow.identifierKind);
    if (problem) return setIdentifierError(t(problem));
    setIdentifierError(null);
    onStepChange('password');
  };

  const back = () => {
    flow.setPassword('');
    flow.setConfirmPassword('');
    flow.backFromMfa();
    onStepChange('identifier');
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
            <Button type="submit" fullWidth>
              {t('signIn.continue')}
            </Button>
          </Stack>
        </form>
        {social}
      </Stack>
    );
  }

  return (
    <form onSubmit={isSignIn ? flow.submitSignIn : flow.submitSignUp}>
      <Stack gap="md">
        <IdentityChip identifier={flow.identifier} kind={flow.identifierKind} onChange={back} />
        {mfaMode ? (
          <CodeInput label={t('mfa.label')} hint={t('mfa.hint')} value={flow.mfaCode} onChange={flow.setMfaCode} />
        ) : (
          <>
            <Stack gap={6}>
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
              {isSignIn && onForgot && (
                <Group justify="flex-end">
                  <TextLink onClick={onForgot}>{t('signIn.forgot')}</TextLink>
                </Group>
              )}
            </Stack>
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
          </>
        )}
        <Button type="submit" fullWidth loading={flow.isLoading} disabled={mfaMode && flow.mfaCode.length < 6}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
