import { Stack, Text } from '@mantine/core';

import { AppAlert } from '@/components/uiKit/AppAlert';

import { useT } from '../../../../context';
import { CopyField } from '../../../ui/CopyField';

// A new key's value, shown once: copy it now
export function CreatedKeyAlert({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  const t = useT();
  return (
    <AppAlert severity="warning" title={t('apiKeys.saveNow')} onClose={onDismiss}>
      <Stack gap="xs">
        <Text inherit>{t('apiKeys.notShownAgain')}</Text>
        <CopyField value={apiKey} copyLabel={t('apiKeys.copyKey')} />
      </Stack>
    </AppAlert>
  );
}
