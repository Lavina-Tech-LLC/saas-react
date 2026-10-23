import { useState, type FormEvent } from 'react';

import type { IdentifierKind } from '../../../auth/identifier';
import {
  isFaceRequired,
  isMfaRequired,
  type FaceRequiredResult,
  type OAuthProvider,
  type PhoneOtpChannel,
  type SignUpResult,
} from '../../../auth/types';
import { useSaaSContext } from '../../context';
import { useAuth } from '../../hooks/useAuth';
import { useSignIn } from '../../hooks/useSignIn';
import { useSignUp } from '../../hooks/useSignUp';
import { deriveSignInSettings } from './signInSettings';
import { useFaceStep } from './useFaceStep';
import type { InviteFlow } from './useInviteFlow';
import { usePhoneCodeFlow } from './usePhoneCodeFlow';
import { useSignUpVerification } from './useSignUpVerification';

export type SignInMode = 'signIn' | 'signUp';

/** All state and actions of the sign-in / sign-up screen except invites. */
export function useSignInFlow(initialMode: SignInMode, invite: InviteFlow) {
  const { settings, t } = useSaaSContext();
  const { refreshUser } = useAuth();
  const signInApi = useSignIn();
  const signUpApi = useSignUp();
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
  const verification = useSignUpVerification(identifier, cfg.phoneOtpChannels);

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
    phoneCode.reset();
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

  const phoneCode = usePhoneCodeFlow({
    identifier,
    inviteCode: invite.activeCode,
    onMfa: setMfaToken,
    onFace: setFaceChallenge,
    onSignUp: finishSignUp,
  });

  const register = async (otpToken?: string) => {
    const result = await signUpApi.signUp(identifier, password, {
      inviteCode: invite.activeCode,
      kind: identifierKind,
      otpToken: otpToken ?? verification.otpToken ?? undefined,
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
    // Stops at the code (or channel) step; errors show through verification.error
    if (isPhone && cfg.phoneOtpRequired && !verification.otpToken && (await verification.start())) return;
    await register();
  };

  // Picked on the channel screen; a project left with no channel signs the number up unverified, as the server does
  const pickVerifyChannel = async (channel: PhoneOtpChannel) => {
    if (!(await verification.send(channel))) await register();
  };

  const submitOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    const otpToken = await verification.verify();
    if (otpToken && (await register(otpToken))) verification.finish();
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
    clearErrors,
    mfaMode: !!mfaToken,
    mfaCode,
    setMfaCode,
    backFromMfa,
    ...faceStep,
    verification,
    pickVerifyChannel,
    submitOtp,
    phoneCode,
    submitSignIn,
    submitSignUp,
    oauth,
    // Every error is visible in the mode it belongs to — including OAuth errors while signing up
    error:
      phoneCode.error ||
      (isSignIn ? signInApi.error : validationError || verification.error || signUpApi.error || signInApi.error),
    otpError: verification.error || signUpApi.error,
    // MFA can follow a phone code in either mode
    isLoading: isSignIn || mfaToken ? signInApi.isLoading : signUpApi.isLoading || verification.isLoading,
  };
}

export type SignInFlow = ReturnType<typeof useSignInFlow>;
