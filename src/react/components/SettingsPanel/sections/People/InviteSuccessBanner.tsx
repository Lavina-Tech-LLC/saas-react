import { Stack, Text } from '@mantine/core';

import { AppAlert } from '@/components/uiKit/AppAlert';

import { useT } from '../../../../context';
import { CopyField } from '../../../ui/CopyField';

export interface InviteSuccess {
  identifier: string;
  url?: string;
}

// After a personal invite is sent: who it went to, and its link to share by hand
export function InviteSuccessBanner({ success, onDismiss }: { success: InviteSuccess; onDismiss: () => void }) {
  const t = useT();
  return (
    <AppAlert severity="success" onClose={onDismiss}>
      <Stack gap="xs">
        <Text inherit>
          {t('people.inviteCreatedFor')}{' '}
          <Text span inherit fw={700}>
            {success.identifier}
          </Text>
        </Text>
        {success.url && <CopyField value={success.url} copyLabel={t('people.copyInviteLink')} />}
      </Stack>
    </AppAlert>
  );
}
