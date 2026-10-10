import { Divider, Stack, Text } from '@mantine/core';
import { useState } from 'react';

import type { FacePose } from '../../../auth/face/engine';
import { useSaaSContext } from '../../context';
import { FaceScanner } from '../FaceScanner/FaceScanner';
import { AuthCard } from '../ui/AuthCard';
import { ErrorAlert } from '../ui/ErrorAlert';
import { TextLink } from '../ui/TextLink';
import { CredentialsForm, type CredentialStep } from './CredentialsForm';
import { ForgotPassword } from './ForgotPassword';
import { InviteScreens } from './InviteScreens';
import { formatInviterName } from './inviteUrl';
import { LegalLinks } from './LegalLinks';
import { OAuthButtons } from './OAuthButtons';
import { OtpScreen } from './OtpScreen';
import { ResetPassword } from './ResetPassword';
import { DEFAULT_FACE_POSES } from './signInSettings';
import { useAfterAuth, type AfterAuthOptions } from './useAfterAuth';
import { useInviteFlow } from './useInviteFlow';
import { useSignInFlow, type SignInMode } from './useSignInFlow';

export interface SignInProps extends AfterAuthOptions {
  initialMode?: SignInMode;
  /** Invite code; read from `?invite_code=` when omitted. */
  inviteCode?: string;
  /** Token from an emailed password-reset link — pass it from your route's URL to show the new-password form. */
  resetToken?: string;
  /** Called after the reset-link flow (success or "Back to sign in") so the host can drop the token from its URL. */
  onPasswordReset?: () => void;
}

export function SignIn({ initialMode = 'signIn', inviteCode, resetToken, onPasswordReset, ...afterAuth }: SignInProps) {
  const { t, user } = useSaaSContext();
  const invite = useInviteFlow(inviteCode);
  const flow = useSignInFlow(initialMode, invite);
  const [forgot, setForgot] = useState(false);
  const [step, setStep] = useState<CredentialStep>('identifier');
  const { cfg, isSignIn } = flow;
  useAfterAuth(user, isSignIn ? 'signIn' : 'signUp', afterAuth);

  if (resetToken) return <ResetPassword token={resetToken} onDone={onPasswordReset} />;

  const acceptInvite = () => {
    if (invite.isSignedIn) return void invite.acceptAsSignedIn();
    // Guests sign up with the invite attached; email invites prefill the address
    if (invite.info?.type === 'email' && invite.info.targetEmail) {
      flow.setIdentifier(invite.info.targetEmail);
      flow.setIdentifierKind('email');
      setStep('password');
    }
    flow.setMode('signUp');
    invite.setShowSignUp(true);
  };

  if (invite.code && !invite.showSignUp) return <InviteScreens invite={invite} onAccept={acceptInvite} />;

  if (flow.faceActive) {
    return (
      <FaceScanner
        poses={(flow.enrolling ? (flow.faceChallenge?.poses ?? DEFAULT_FACE_POSES) : ['center']) as FacePose[]}
        title={flow.enrolling ? t('face.enroll.title') : t('face.verify.title')}
        subtitle={flow.enrolling ? t('face.enroll.subtitle') : t('face.verify.subtitle')}
        consentText={flow.enrolling ? t('face.consent') : undefined}
        confirmLabel={flow.enrolling ? t('face.enroll.start') : t('face.verify.start')}
        modelUrl={cfg.faceModelUrl}
        isSubmitting={flow.face.isLoading}
        error={flow.face.error}
        onComplete={flow.completeFace}
        onCancel={flow.cancelFace}
      />
    );
  }

  if (flow.otpStep) return <OtpScreen flow={flow} />;

  if (forgot) {
    return (
      <ForgotPassword
        cfg={cfg}
        initialKind={flow.identifierKind}
        initialIdentifier={flow.identifier}
        onBack={() => setForgot(false)}
      />
    );
  }

  const inviteHeader = invite.showSignUp && invite.info;
  const onSecondStep = step === 'password' || flow.mfaMode;
  // Step one asks who you are; step two leads with the identity chip, so it needs no subtitle
  const title = inviteHeader
    ? t('invite.joinOrg', { org: invite.info!.orgName })
    : flow.mfaMode
      ? t('mfa.title')
      : onSecondStep
        ? isSignIn
          ? t('signIn.passwordTitle')
          : t('signUp.passwordTitle')
        : isSignIn
          ? t('signIn.title')
          : t('signUp.title');
  const subtitle = inviteHeader
    ? t('invite.invitedBy', {
        inviter: formatInviterName(invite.info!, t),
        role: invite.info!.roleName || invite.info!.role,
      })
    : onSecondStep
      ? undefined
      : isSignIn
        ? t('signIn.subtitle')
        : t('signUp.subtitle');

  const social = cfg.hasOAuth && (
    <Stack gap="sm">
      <Divider label={t('divider.or')} labelPosition="center" />
      <OAuthButtons
        google={cfg.googleEnabled}
        github={cfg.githubEnabled}
        loading={flow.isLoading}
        onSelect={flow.oauth}
      />
    </Stack>
  );

  return (
    <AuthCard title={title} subtitle={subtitle}>
      <ErrorAlert message={flow.error} />
      <CredentialsForm
        flow={flow}
        step={step}
        onStepChange={setStep}
        onForgot={() => setForgot(true)}
        social={social}
      />
      <LegalLinks privacyUrl={cfg.privacyPolicyUrl} termsUrl={cfg.termsOfServiceUrl} />
      <Footer flow={flow} inviteActive={invite.showSignUp} onCancelInvite={invite.dismiss} />
    </AuthCard>
  );
}

function Footer({
  flow,
  inviteActive,
  onCancelInvite,
}: {
  flow: ReturnType<typeof useSignInFlow>;
  inviteActive: boolean;
  onCancelInvite: () => void;
}) {
  const { t } = useSaaSContext();
  // During MFA the identity chip's "Change" is the way back
  if (flow.mfaMode) return null;
  return (
    <Stack gap={4} align="center">
      {flow.isSignIn && flow.canSignUp && (
        <Text fz="sm" c="dimmed">
          {t('signIn.noAccount')} <TextLink onClick={() => flow.switchMode('signUp')}>{t('signUp.submit')}</TextLink>
        </Text>
      )}
      {!flow.isSignIn && (
        <Text fz="sm" c="dimmed">
          {t('signIn.hasAccount')} <TextLink onClick={() => flow.switchMode('signIn')}>{t('signIn.submit')}</TextLink>
        </Text>
      )}
      {inviteActive && <TextLink onClick={onCancelInvite}>{t('common.cancel')}</TextLink>}
    </Stack>
  );
}
