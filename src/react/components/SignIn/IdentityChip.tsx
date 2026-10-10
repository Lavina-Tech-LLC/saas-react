import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { Mail, Phone } from 'lucide-react';

import type { IdentifierKind } from '../../../auth/identifier';
import { useT } from '../../context';
import { TextLink } from '../ui/TextLink';

interface IdentityChipProps {
  identifier: string;
  kind: IdentifierKind;
  onChange: () => void;
}

// Step two leads with who is signing in — the one thing on the screen that is about the user, not the form
export function IdentityChip({ identifier, kind, onChange }: IdentityChipProps) {
  const t = useT();
  return (
    <Paper withBorder radius="xl" px="sm" py={6}>
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="xs" wrap="nowrap" miw={0}>
          <ThemeIcon size="md" radius="xl" variant="light">
            {kind === 'phone' ? <Phone size={14} /> : <Mail size={14} />}
          </ThemeIcon>
          <Text fz="sm" fw={600} truncate ff={kind === 'phone' ? 'monospace' : undefined}>
            {identifier.trim()}
          </Text>
        </Group>
        <TextLink onClick={onChange}>{t('common.change')}</TextLink>
      </Group>
    </Paper>
  );
}
