import { Button, Center, Loader, Stack } from '@mantine/core';
import { KeyRound, Plus } from 'lucide-react';
import { useState } from 'react';

import { AppAlert } from '@/components/uiKit/AppAlert';
import { ConfirmDialog } from '@/components/uiKit/ConfirmDialog';
import { EmptyState } from '@/components/uiKit/EmptyState';
import { SECTION_GAP } from '@/styles/spacing';

import type { ApiKey, CreatedApiKey } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useApiKeys } from '../../../../hooks/useApiKeys';
import { useOrg } from '../../../../hooks/useOrg';
import { SettingsBlock } from '../../SettingsBlock';
import { ApiKeysTable } from './ApiKeysTable';
import { CreateApiKeySheet } from './CreateApiKeySheet';
import { CreatedKeyAlert } from './CreatedKeyAlert';

// Admins and owners: the selected organization's API keys — create (in a bottom sheet), copy once, revoke
export function ApiKeysSection() {
  const t = useT();
  const { selectedOrg, roles } = useOrg();
  const { keys, isLoading, error, setError, create, revoke } = useApiKeys(selectedOrg?.id ?? null);
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  if (!selectedOrg) {
    return <EmptyState icon={KeyRound} title={t('people.noOrgTitle')} description={t('settings.selectOrgApiKeys')} />;
  }

  const confirmRevoke = async () => {
    if (!revoking) return;
    setIsRevoking(true);
    const revoked = await revoke(revoking.id);
    setIsRevoking(false);
    if (revoked) setRevoking(null); // on failure the dialog stays open with the error
  };
  const createButton = (
    <Button leftSection={<Plus size={18} />} onClick={() => setCreateOpen(true)}>
      {t('apiKeys.create')}
    </Button>
  );

  let content;
  if (isLoading && keys.length === 0) {
    content = (
      <Center py="xl">
        <Loader />
      </Center>
    );
  } else if (keys.length === 0) {
    content = <EmptyState icon={KeyRound} title={t('apiKeys.noneTitle')} description={t('apiKeys.none')} />;
  } else {
    content = <ApiKeysTable keys={keys} onRevoke={setRevoking} />;
  }

  return (
    <Stack gap={SECTION_GAP}>
      {error && !revoking && <AppAlert severity="error">{error}</AppAlert>}
      {createdKey && <CreatedKeyAlert apiKey={createdKey.key} onDismiss={() => setCreatedKey(null)} />}
      <SettingsBlock title={t('apiKeys.yours')} action={createButton}>
        {content}
      </SettingsBlock>
      <CreateApiKeySheet
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
      <ConfirmDialog
        opened={revoking !== null}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title={t('apiKeys.revokeTitle', { name: revoking?.name ?? '' })}
        description={t('apiKeys.revokeConfirm')}
        confirmLabel={t('apiKeys.revoke')}
        loading={isRevoking}
        error={revoking ? error : undefined}
      />
    </Stack>
  );
}
