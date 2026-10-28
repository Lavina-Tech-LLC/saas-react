import { Button } from '@mantine/core';

import { useT } from '../../context';
import { AuthActions } from '../ui/AuthActions';
import { ChannelButtons } from './ChannelButtons';
import type { SignInFlow } from './useSignInFlow';

interface ChannelStepProps {
  flow: SignInFlow;
  onPassword: () => void;
}

// Step two for a phone number when the project signs in by code: where the code goes, or a password after all
export function ChannelStep({ flow, onPassword }: ChannelStepProps) {
  const t = useT();
  const { phoneCode } = flow;
  return (
    <>
      <ChannelButtons
        channels={flow.cfg.phoneOtpChannels ?? []}
        loading={phoneCode.sending}
        onSelect={(channel) => void phoneCode.request(channel)}
      />
      <AuthActions
        start={
          <Button variant="subtle" onClick={onPassword}>
            {flow.isSignIn ? t('phoneCode.usePassword') : t('phoneCode.setPassword')}
          </Button>
        }
      />
    </>
  );
}
