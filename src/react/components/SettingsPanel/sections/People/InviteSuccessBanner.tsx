import { Alert, Stack, Text } from '@mantine/core';
import { CheckCircle } from 'lucide-react';

import { useT } from '../../../../context';
import { CopyField } from '../../../ui/CopyField';

export interface InviteSuccess {
  identifier: string;
  url?: string;
}

// Shown after a personal invite is created; the shareable link can be copied from here
export function InviteSuccessBanner({ success, onDismiss }: { success: InviteSuccess; onDismiss: () => void }) {
  const t = useT();
  return (
    <Alert
      color="green"
      icon={<CheckCircle size={16} />}
      p="xs"
      withCloseButton
      onClose={onDismiss}
      closeButtonLabel={t('common.dismiss')}
    >
      <Stack gap="xs">
        <Text fz="sm">
          {t('people.inviteCreatedFor')}{' '}
          <Text span fw={600}>
            {success.identifier}
          </Text>
        </Text>
        {success.url && <CopyField value={success.url} copyLabel={t('people.copyInviteLink')} />}
      </Stack>
    </Alert>
  );
}
