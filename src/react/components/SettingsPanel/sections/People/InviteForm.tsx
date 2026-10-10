import { Button, Group, Paper, SegmentedControl, Select, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import type { IdentifierKind } from '../../../../../auth/identifier';
import type { Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import type { InviteSuccess } from './InviteSuccessBanner';

interface InviteFormProps {
  orgId: string;
  assignableRoles: Role[];
  canInviteByEmail: boolean;
  canInviteByPhone: boolean;
  onStart: () => void;
  onInvited: (success: InviteSuccess) => void;
}

// Personal invite by e-mail or phone number
export function InviteForm({
  orgId,
  assignableRoles,
  canInviteByEmail,
  canInviteByPhone,
  onStart,
  onInvited,
}: InviteFormProps) {
  const t = useT();
  const { sendInvite, refreshInvites, getInviteLinkUrl } = useOrg();
  const [chosenKind, setChosenKind] = useState<IdentifierKind>('email');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('member');
  const [pending, setPending] = useState(false);
  // Only one channel enabled → that channel is forced
  const kind: IdentifierKind =
    !canInviteByEmail && canInviteByPhone ? 'phone' : canInviteByEmail && !canInviteByPhone ? 'email' : chosenKind;
  const isPhone = kind === 'phone';

  const switchKind = (value: string) => {
    setChosenKind(value as IdentifierKind);
    setIdentifier('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    onStart();
    setPending(true);
    try {
      const result = await sendInvite(orgId, identifier, role, undefined, kind);
      if (!result) return;
      onInvited({ identifier, url: getInviteLinkUrl(result) });
      setIdentifier('');
      setRole('member');
      void refreshInvites(orgId);
    } finally {
      setPending(false);
    }
  };

  return (
    <Paper p="md" bg="var(--mantine-color-default-hover)">
      <form onSubmit={submit}>
        <Stack gap="sm">
          {canInviteByEmail && canInviteByPhone && (
            <SegmentedControl
              size="xs"
              value={kind}
              onChange={switchKind}
              data={[
                { value: 'email', label: t('identifier.toggleEmail') },
                { value: 'phone', label: t('identifier.togglePhone') },
              ]}
              style={{ alignSelf: 'flex-start' }}
            />
          )}
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={isPhone ? t('identifier.phone') : t('common.email')}
              type={isPhone ? 'tel' : 'email'}
              inputMode={isPhone ? 'tel' : 'email'}
              placeholder={isPhone ? t('people.phonePlaceholder') : t('people.emailPlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.currentTarget.value)}
              required
            />
            <Select
              label={t('common.role')}
              data={assignableRoles.map((r) => ({ value: r.key, label: r.name }))}
              value={role}
              onChange={(value) => value && setRole(value)}
              allowDeselect={false}
            />
          </SimpleGrid>
          <Group justify="flex-end">
            <Button type="submit" loading={pending}>
              {t('common.send')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
