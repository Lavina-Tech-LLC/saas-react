import { Box, Button, Checkbox, em, Group, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, type FormEvent } from 'react';

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

interface CreateApiKeyModalProps {
  opened: boolean;
  onClose: () => void;
  roles: Role[];
  create: (input: CreateApiKeyInput) => Promise<CreatedApiKey | null>;
  setError: (error: string | null) => void;
  onCreated: (created: CreatedApiKey) => void;
}

// LM3 §20 form modal: name, expiration and roles for a new API key
export function CreateApiKeyModal({ opened, onClose, roles, create, setError, onCreated }: CreateApiKeyModalProps) {
  const t = useT();
  const isMobile = useMediaQuery(`(max-width: ${em(767)})`);
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

  // Fresh form every time the modal opens
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

  const expirationData = EXPIRATION_OPTIONS.map((o) => ({
    value: o.days === null ? 'never' : String(o.days),
    label: t(o.key),
  }));

  return (
    <Modal opened={opened} onClose={onClose} title={t('apiKeys.create')} fullScreen={isMobile}>
      <Box p="md">
        <form onSubmit={submit}>
          <Stack gap="md">
            <TextInput
              label={t('common.name')}
              placeholder={t('apiKeys.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              maxLength={100}
              required
              autoFocus
            />
            <Select
              label={t('apiKeys.expiration')}
              data={expirationData}
              value={expiration}
              onChange={(v) => setExpiration(v ?? DEFAULT_EXPIRATION)}
              allowDeselect={false}
            />
            {roles.length > 0 ? (
              <Checkbox.Group label={t('common.roles')} value={roleIds} onChange={setRoleIds}>
                <Stack gap="xs" mt="xs">
                  {roles.map((r) => (
                    <Checkbox
                      key={r.id}
                      value={r.id}
                      label={
                        <>
                          {r.name}
                          {r.description && (
                            <Text span fz="sm" c="dimmed">
                              {` — ${r.description}`}
                            </Text>
                          )}
                        </>
                      }
                    />
                  ))}
                </Stack>
              </Checkbox.Group>
            ) : (
              <Text fz="sm" c="dimmed">
                {t('apiKeys.noRoles')}
              </Text>
            )}
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={onClose} disabled={isCreating}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={isCreating} disabled={!name.trim()}>
                {t('common.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}
