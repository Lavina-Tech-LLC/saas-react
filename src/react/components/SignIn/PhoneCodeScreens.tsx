import { useT } from '../../context';
import { ChannelPickScreen } from './ChannelPickScreen';
import { needsChannelChoice } from './otpChannels';
import { OtpScreen } from './OtpScreen';
import type { SignInFlow } from './useSignInFlow';

interface PhoneCodeScreensProps {
  flow: SignInFlow;
  /** Back to the first step, from the sign-in code screen. */
  onChangeNumber: () => void;
}

// The full-card code screens: confirming a phone sign-up (channel, then code) or signing in with a code
export function PhoneCodeScreens({ flow, onChangeNumber }: PhoneCodeScreensProps) {
  const t = useT();
  const { verification, phoneCode } = flow;

  if (verification.step === 'channel') {
    return (
      <ChannelPickScreen
        identifier={flow.identifier}
        channels={flow.cfg.phoneOtpChannels ?? []}
        loading={flow.isLoading}
        error={verification.error}
        onSelect={(channel) => void flow.pickVerifyChannel(channel)}
        onBack={verification.leave}
      />
    );
  }

  if (verification.step === 'code') {
    return (
      <OtpScreen
        title={t('otp.title')}
        submitLabel={t('otp.submit')}
        identifier={flow.identifier}
        channel={verification.channel}
        code={verification.code}
        onCodeChange={verification.setCode}
        onSubmit={flow.submitOtp}
        error={flow.otpError}
        loading={flow.isLoading}
        resendAfterSeconds={verification.resendAfterSeconds}
        onResend={() => void verification.resend()}
        onOtherWay={verification.otherWay}
        onChangeNumber={verification.leave}
      />
    );
  }

  return (
    <OtpScreen
      title={t('phoneCode.codeTitle')}
      submitLabel={flow.isSignIn ? t('signIn.submit') : t('signUp.submit')}
      identifier={flow.identifier}
      channel={phoneCode.channel}
      code={phoneCode.code}
      onCodeChange={phoneCode.setCode}
      onSubmit={phoneCode.submit}
      error={phoneCode.error}
      loading={phoneCode.isLoading}
      resendAfterSeconds={phoneCode.resendAfterSeconds}
      onResend={() => void phoneCode.resend()}
      onOtherWay={needsChannelChoice(flow.cfg.phoneOtpChannels) ? phoneCode.otherWay : undefined}
      onChangeNumber={() => {
        phoneCode.reset();
        onChangeNumber();
      }}
    />
  );
}
