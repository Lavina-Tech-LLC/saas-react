import { Button, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { KeyRound, Plus } from 'lucide-react';
import { useState } from 'react';

import type { ApiKey, CreatedApiKey } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useApiKeys } from '../../../../hooks/useApiKeys';
import { useOrg } from '../../../../hooks/useOrg';
import { ConfirmModal } from '../../../ui/ConfirmModal';
import { EmptyState } from '../../../ui/EmptyState';
import { ErrorAlert } from '../../../ui/ErrorAlert';
import { SettingsSection } from '../../../ui/SettingsSection';
import { ApiKeysTable } from './ApiKeysTable';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { CreatedKeyAlert } from './CreatedKeyAlert';

// Admin/owner: list, create and revoke the selected org's API keys
export function ApiKeysSection() {
  const t = useT();
  const { selectedOrg, roles } = useOrg();
  const { keys, isLoading, error, setError, create, revoke } = useApiKeys(selectedOrg?.id ?? null);
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  if (!selectedOrg) {
    return (
      <Stack gap="lg">
        <Title order={4}>{t('apiKeys.title')}</Title>
        <EmptyState icon={<KeyRound size={24} />}>{t('settings.selectOrgApiKeys')}</EmptyState>
      </Stack>
    );
  }

  const confirmRevoke = async () => {
    if (!revoking) return;
    setIsRevoking(true);
    const revoked = await revoke(revoking.id);
    setIsRevoking(false);
    if (revoked) setRevoking(null); // on failure the dialog stays open; the error shows above
  };

  let content;
  if (isLoading && keys.length === 0) {
    content = (
      <Center py="xl">
        <Loader size={32} />
      </Center>
    );
  } else if (keys.length === 0) {
    content = (
      <Text fz="sm" c="dimmed">
        {t('apiKeys.none')}
      </Text>
    );
  } else {
    content = <ApiKeysTable keys={keys} onRevoke={setRevoking} />;
  }

  return (
    <Stack gap="lg">
      <Title order={4}>{t('apiKeys.title')}</Title>
      <ErrorAlert message={error} />
      {createdKey && <CreatedKeyAlert apiKey={createdKey.key} onDismiss={() => setCreatedKey(null)} />}
      <SettingsSection
        title={t('apiKeys.yours')}
        icon={<KeyRound size={18} />}
        action={
          <Button size="sm" leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            {t('apiKeys.create')}
          </Button>
        }
      >
        {content}
      </SettingsSection>
      <CreateApiKeyModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        roles={roles}
        create={create}
        setError={setError}
        onCreated={(created) => {
          setCreatedKey(created);
          setCreateOpen(false);
        }}
      />
      <ConfirmModal
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('apiKeys.revokeTitle')}
        confirmLabel={t('apiKeys.revoke')}
        loading={isRevoking}
      >
        {t('apiKeys.revokeConfirm', { name: revoking?.name ?? '' })}
      </ConfirmModal>
    </Stack>
  );
}
