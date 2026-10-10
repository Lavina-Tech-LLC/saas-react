import { useState, type FormEvent } from 'react';

import type { IdentifierKind } from '../../../auth/identifier';
import {
  isFaceRequired,
  isMfaRequired,
  type FaceRequiredResult,
  type OAuthProvider,
  type SignUpResult,
} from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { useAuth } from '../../hooks/useAuth';
import { usePhoneOtp } from '../../hooks/usePhoneOtp';
import { useSignIn } from '../../hooks/useSignIn';
import { useSignUp } from '../../hooks/useSignUp';
import { deriveSignInSettings } from './signInSettings';
import { useFaceStep } from './useFaceStep';
import type { InviteFlow } from './useInviteFlow';

export type SignInMode = 'signIn' | 'signUp';

/** All state and actions of the sign-in / sign-up screen except invites. */
export function useSignInFlow(initialMode: SignInMode, invite: InviteFlow) {
  const { settings, t } = useSaaSContext();
  const { refreshUser } = useAuth();
  const signInApi = useSignIn();
  const signUpApi = useSignUp();
  const phoneOtp = usePhoneOtp();
  const cfg = deriveSignInSettings(settings);

  const [mode, setMode] = useState<SignInMode>(initialMode);
  // Cancelling a face challenge raised by sign-up returns to sign-in
  const faceStep = useFaceStep(() => setMode((m) => (m === 'signUp' ? 'signIn' : m)));
  const { setFaceChallenge } = faceStep;
  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const canSignUp = cfg.registrationEnabled || invite.showSignUp;
  const isSignIn = canSignUp ? mode === 'signIn' : true;
  const isPhone = identifierKind === 'phone';

  // Snap the identifier kind to what the project allows — applied when the settings (re)arrive
  const forcedKind: IdentifierKind | null =
    !cfg.emailAuthEnabled && cfg.phoneAuthEnabled
      ? 'phone'
      : cfg.emailAuthEnabled && !cfg.phoneAuthEnabled
        ? 'email'
        : null;
  const [appliedForcedKind, setAppliedForcedKind] = useState<IdentifierKind | null>(null);
  if (forcedKind !== appliedForcedKind) {
    setAppliedForcedKind(forcedKind);
    if (forcedKind) setIdentifierKind(forcedKind);
    if (forcedKind === 'phone') setIdentifier((current) => (current === '' ? cfg.dialCode : current));
  }

  const clearErrors = () => {
    signInApi.setError(null);
    signUpApi.setError(null);
    setValidationError(null);
  };

  const switchMode = (next: SignInMode) => {
    setMode(next);
    clearErrors();
    setMfaToken(null);
    setMfaCode('');
  };

  const switchIdentifierKind = (kind: IdentifierKind) => {
    setIdentifierKind(kind);
    setIdentifier(kind === 'phone' ? cfg.dialCode : '');
    clearErrors();
  };

  const submitSignIn = async (e?: FormEvent) => {
    e?.preventDefault();
    const result = mfaToken
      ? await signInApi.submitMfaCode(mfaToken, mfaCode)
      : await signInApi.signIn(identifier, password, identifierKind);
    if (!result) return;
    if (isMfaRequired(result)) {
      setMfaToken(result.mfaToken);
      signInApi.setError(null);
    } else if (isFaceRequired(result)) {
      setFaceChallenge(result);
      setMfaToken(null);
      signInApi.setError(null);
    }
  };

  const finishSignUp = async (result: SignUpResult | FaceRequiredResult) => {
    const viaInvite = invite.showSignUp;
    if (viaInvite) invite.dismiss();
    if (isFaceRequired(result)) return setFaceChallenge(result);
    if (result.faceEnrollmentRequired) return faceStep.requireEnrollment();
    if (viaInvite) await refreshUser();
  };

  const register = async (otpToken?: string) => {
    const result = await signUpApi.signUp(identifier, password, {
      inviteCode: invite.activeCode,
      kind: identifierKind,
      otpToken: otpToken ?? phoneOtp.otpToken ?? undefined,
      faceChallenge: true,
    });
    if (result) await finishSignUp(result);
    return !!result;
  };

  const submitSignUp = async (e?: FormEvent) => {
    e?.preventDefault();
    setValidationError(null);
    if (password !== confirmPassword) return setValidationError(t('error.passwordMismatch'));
    if (password.length < cfg.passwordMinLength) {
      return setValidationError(t('error.passwordTooShort', { min: cfg.passwordMinLength }));
    }
    if (isPhone && cfg.phoneOtpRequired && !phoneOtp.otpToken) {
      const outcome = await phoneOtp.send(identifier, 'register');
      if (outcome.status === 'sent') return setOtpStep(true);
      if (outcome.status === 'error') return; // shown through phoneOtp.error
    }
    await register();
  };

  const submitOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    const verified = await phoneOtp.verify(identifier, otpCode, 'register');
    if (!verified) return;
    if (await register(verified.otpToken)) {
      setOtpStep(false);
      setOtpCode('');
    }
  };

  const leaveOtp = () => {
    setOtpStep(false);
    setOtpCode('');
    phoneOtp.reset();
  };

  const oauth = async (provider: OAuthProvider) => {
    const result = await signInApi.signInWithOAuth(provider, invite.activeCode);
    if (result && isFaceRequired(result)) setFaceChallenge(result);
  };

  const backFromMfa = () => {
    setMfaToken(null);
    setMfaCode('');
    signInApi.setError(null);
  };

  return {
    cfg,
    mode,
    setMode,
    isSignIn,
    canSignUp,
    isPhone,
    switchMode,
    switchIdentifierKind,
    identifierKind,
    setIdentifierKind,
    identifier,
    setIdentifier,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    setValidationError,
    mfaMode: !!mfaToken,
    mfaCode,
    setMfaCode,
    backFromMfa,
    ...faceStep,
    otpStep,
    otpCode,
    setOtpCode,
    submitOtp,
    leaveOtp,
    phoneOtp,
    submitSignIn,
    submitSignUp,
    oauth,
    // Every error is visible in the mode it belongs to — including OAuth errors while signing up
    error: isSignIn ? signInApi.error : validationError || phoneOtp.error || signUpApi.error || signInApi.error,
    otpError: phoneOtp.error || signUpApi.error,
    isLoading: isSignIn ? signInApi.isLoading : signUpApi.isLoading || phoneOtp.isLoading,
  };
}

export type SignInFlow = ReturnType<typeof useSignInFlow>;
