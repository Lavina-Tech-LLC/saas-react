import { Button, Divider, Stack } from '@mantine/core';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';

import type { FacePose } from '../../../auth/face/engine';
import { useSaaSContext } from '../../context';
import { FaceScanner } from '../FaceScanner/FaceScanner';
import { AuthCard } from '../ui/AuthCard';
import { CredentialsForm, type CredentialStep } from './CredentialsForm';
import { ForgotPassword } from './ForgotPassword';
import { IdentityChip } from './IdentityChip';
import { InviteScreens } from './InviteScreens';
import { formatInviterName } from './inviteUrl';
import { LegalLinks } from './LegalLinks';
import { OAuthButtons } from './OAuthButtons';
import { PhoneCodeScreens } from './PhoneCodeScreens';
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
  // A phone code signs in or registers whatever the mode — the server says which
  useAfterAuth(user, flow.phoneCode.authAction ?? (isSignIn ? 'signIn' : 'signUp'), afterAuth);

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

  if (flow.verification.step || flow.phoneCode.codeSent) {
    return <PhoneCodeScreens flow={flow} onChangeNumber={() => setStep('identifier')} />;
  }

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
  const onSecondStep = step !== 'identifier' || flow.mfaMode;
  // Step one asks who you are; step two leads with the identity chip, so it needs no subtitle
  const title = inviteHeader
    ? t('invite.joinOrg', { org: invite.info!.orgName })
    : flow.mfaMode
      ? t('mfa.title')
      : step === 'channel'
        ? t('phoneCode.title')
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

  // Step two leads with who is signing in; the chip goes back to step one
  const backToIdentifier = () => {
    flow.setPassword('');
    flow.setConfirmPassword('');
    flow.backFromMfa();
    flow.phoneCode.reset();
    setStep('identifier');
  };
  const chip = onSecondStep && (
    <IdentityChip identifier={flow.identifier} kind={flow.identifierKind} onChange={backToIdentifier} />
  );

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
  // Step one's quieter action: leave an invite, or switch between signing in and up
  const switchAction = invite.showSignUp ? (
    <Button variant="subtle" onClick={invite.dismiss}>
      {t('common.cancel')}
    </Button>
  ) : isSignIn ? (
    flow.canSignUp && (
      <Button variant="subtle" onClick={() => flow.switchMode('signUp')}>
        {t('signUp.createAccount')}
      </Button>
    )
  ) : (
    <Button variant="subtle" onClick={() => flow.switchMode('signIn')}>
      {t('signIn.instead')}
    </Button>
  );

  return (
    <AuthCard title={title} subtitle={subtitle} aside={chip}>
      {flow.error && <AppAlert severity="error">{flow.error}</AppAlert>}
      <CredentialsForm
        flow={flow}
        step={step}
        onStepChange={setStep}
        onForgot={() => setForgot(true)}
        switchAction={switchAction}
        social={social}
      />
      <LegalLinks privacyUrl={cfg.privacyPolicyUrl} termsUrl={cfg.termsOfServiceUrl} />
    </AuthCard>
  );
}
