import { Button, SegmentedControl, Select, Stack, TextInput } from '@mantine/core';
import { useState, type FormEvent } from 'react';

import { BottomSheet } from '@/components/uiKit/Sheets';

import type { IdentifierKind } from '../../../../../auth/identifier';
import type { Role } from '../../../../../auth/types';
import { useT } from '../../../../context';
import { useOrg } from '../../../../hooks/useOrg';
import type { InviteSuccess } from './InviteSuccessBanner';

interface InviteSheetProps {
  opened: boolean;
  onClose: () => void;
  orgId: string;
  assignableRoles: Role[];
  canInviteByEmail: boolean;
  canInviteByPhone: boolean;
  onStart: () => void;
  onInvited: (success: InviteSuccess) => void;
}

const FORM = 'saas-invite';

// A personal invite by e-mail or phone, in a bottom sheet (LM3 §20)
export function InviteSheet({
  opened,
  onClose,
  orgId,
  assignableRoles,
  canInviteByEmail,
  canInviteByPhone,
  onStart,
  onInvited,
}: InviteSheetProps) {
  const t = useT();
  const { sendInvite, refreshInvites, getInviteLinkUrl } = useOrg();
  const [chosenKind, setChosenKind] = useState<IdentifierKind>('email');
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState('member');
  const [pending, setPending] = useState(false);
  // Only one channel enabled: that channel
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
    <BottomSheet
      opened={opened}
      onClose={onClose}
      title={t('people.invite')}
      actions={
        <>
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM} loading={pending}>
            {t('common.send')}
          </Button>
        </>
      }
    >
      <Stack component="form" id={FORM} onSubmit={submit} gap="md">
        {canInviteByEmail && canInviteByPhone && (
          <SegmentedControl
            value={kind}
            onChange={switchKind}
            data={[
              { value: 'email', label: t('identifier.toggleEmail') },
              { value: 'phone', label: t('identifier.togglePhone') },
            ]}
          />
        )}
        <TextInput
          label={isPhone ? t('identifier.phone') : t('common.email')}
          type={isPhone ? 'tel' : 'email'}
          inputMode={isPhone ? 'tel' : 'email'}
          value={identifier}
          onChange={(e) => setIdentifier(e.currentTarget.value)}
          required
          data-autofocus
        />
        <Select
          label={t('common.role')}
          data={assignableRoles.map((r) => ({ value: r.key, label: r.name }))}
          value={role}
          onChange={(value) => value && setRole(value)}
          allowDeselect={false}
        />
      </Stack>
    </BottomSheet>
  );
}
