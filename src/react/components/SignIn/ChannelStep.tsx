import { Group, Stack } from '@mantine/core';

import { useT } from '../../context';
import { TextLink } from '../ui/TextLink';
import { ChannelButtons } from './ChannelButtons';
import { IdentityChip } from './IdentityChip';
import type { SignInFlow } from './useSignInFlow';

interface ChannelStepProps {
  flow: SignInFlow;
  onBack: () => void;
  onPassword: () => void;
}

// Step two for a phone number when the project signs in by code: where the code goes, or a password after all
export function ChannelStep({ flow, onBack, onPassword }: ChannelStepProps) {
  const t = useT();
  const { phoneCode } = flow;
  return (
    <Stack gap="md">
      <IdentityChip identifier={flow.identifier} kind="phone" onChange={onBack} />
      <ChannelButtons
        channels={flow.cfg.phoneOtpChannels ?? []}
        loading={phoneCode.sending}
        onSelect={(channel) => void phoneCode.request(channel)}
      />
      <Group justify="center">
        <TextLink onClick={onPassword}>
          {flow.isSignIn ? t('phoneCode.usePassword') : t('phoneCode.setPassword')}
        </TextLink>
      </Group>
    </Stack>
  );
}
