import { Button, Checkbox, Select, Stack, Text, TextInput } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { BottomSheet } from '@/components/uiKit/Sheets';

import type { CreateApiKeyInput, CreatedApiKey, Role } from '../../../../../auth/types';
import type { TranslationKey } from '../../../../../i18n';
import { useT } from '../../../../context';

const EXPIRATION_OPTIONS: { key: TranslationKey; days: number | null }[] = [
  { key: 'apiKeys.exp30', days: 30 },
  { key: 'apiKeys.exp60', days: 60 },
  { key: 'apiKeys.exp90', days: 90 },
  { key: 'apiKeys.exp365', days: 365 },
  { key: 'common.never', days: null },
];
const DEFAULT_EXPIRATION = '30';
const DAY_MS = 864e5;
const FORM = 'saas-create-api-key';

interface CreateApiKeySheetProps {
  opened: boolean;
  onClose: () => void;
  roles: Role[];
  create: (input: CreateApiKeyInput) => Promise<CreatedApiKey | null>;
  setError: (error: string | null) => void;
  onCreated: (created: CreatedApiKey) => void;
}

// A new API key — name, expiry, roles — in a bottom sheet (LM3 §20); a fresh form each time it opens
export function CreateApiKeySheet({ opened, onClose, roles, create, setError, onCreated }: CreateApiKeySheetProps) {
  const t = useT();
  const [name, setName] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [expiration, setExpiration] = useState(DEFAULT_EXPIRATION);
  const [isCreating, setIsCreating] = useState(false);
  const [wasOpened, setWasOpened] = useState(opened);
  const reset = () => {
    setName('');
    setRoleIds([]);
    setExpiration(DEFAULT_EXPIRATION);
  };
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) reset();
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const days = expiration === 'never' ? null : Number(expiration);
    setIsCreating(true);
    const created = await create({
      name: name.trim(),
      roleIds,
      expiresAt: days === null ? null : new Date(Date.now() + days * DAY_MS).toISOString(),
    });
    setIsCreating(false);
    if (!created) return;
    onCreated(created);
    reset();
    setError(null);
  };

  return (
    <BottomSheet
      opened={opened}
      onClose={onClose}
      title={t('apiKeys.create')}
      actions={
        <>
          <Button variant="default" onClick={onClose} disabled={isCreating}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM} loading={isCreating} disabled={!name.trim()}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <Stack component="form" id={FORM} onSubmit={submit} gap="md">
        <TextInput
          label={t('common.name')}
          description={t('apiKeys.nameHint')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          maxLength={100}
          required
          data-autofocus
        />
        <Select
          label={t('apiKeys.expiration')}
          data={EXPIRATION_OPTIONS.map((o) => ({ value: o.days === null ? 'never' : String(o.days), label: t(o.key) }))}
          value={expiration}
          onChange={(v) => setExpiration(v ?? DEFAULT_EXPIRATION)}
          allowDeselect={false}
        />
        {roles.length > 0 ? (
          <Checkbox.Group label={t('common.roles')} value={roleIds} onChange={setRoleIds}>
            <Stack gap="sm" mt="xs">
              {roles.map((r) => (
                <Checkbox key={r.id} value={r.id} label={r.name} description={r.description} />
              ))}
            </Stack>
          </Checkbox.Group>
        ) : (
          <Text fz="sm" c="dimmed">
            {t('apiKeys.noRoles')}
          </Text>
        )}
      </Stack>
    </BottomSheet>
  );
}
