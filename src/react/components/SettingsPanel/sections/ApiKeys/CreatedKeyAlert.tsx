import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { AlertTriangle } from 'lucide-react';

import { useT } from '../../../../context';
import { CopyField } from '../../../ui/CopyField';

// One-time display of a freshly created key's plaintext value
export function CreatedKeyAlert({ apiKey, onDismiss }: { apiKey: string; onDismiss: () => void }) {
  const t = useT();
  return (
    <Alert color="yellow" icon={<AlertTriangle size={16} />}>
      <Stack gap="sm">
        <Text fz="sm">
          <Text span fz="sm" fw={700}>
            {t('apiKeys.saveNow')}
          </Text>{' '}
          {t('apiKeys.notShownAgain')}
        </Text>
        <CopyField value={apiKey} copyLabel={t('apiKeys.copyKey')} />
        <Group justify="flex-end">
          <Button variant="subtle" size="xs" onClick={onDismiss}>
            {t('common.dismiss')}
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
