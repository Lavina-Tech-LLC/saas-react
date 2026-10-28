import { Button, ThemeIcon } from '@mantine/core';
import { ChevronDown, Mail, Phone } from 'lucide-react';

import type { IdentifierKind } from '../../../auth/identifier';
import { useT } from '../../context';

interface IdentityChipProps {
  identifier: string;
  kind: IdentifierKind;
  onChange: () => void;
}

// Step two leads with who is signing in, as Google's account chip: an outlined pill that goes back to change it
export function IdentityChip({ identifier, kind, onChange }: IdentityChipProps) {
  const t = useT();
  const value = identifier.trim();
  return (
    <Button
      variant="default"
      size="sm"
      maw="100%"
      pl={4}
      leftSection={
        <ThemeIcon size={28} radius="xl" variant="light">
          {kind === 'phone' ? <Phone size={14} /> : <Mail size={14} />}
        </ThemeIcon>
      }
      rightSection={<ChevronDown size={16} />}
      aria-label={`${value} — ${t('common.change')}`}
      onClick={onChange}
      styles={{ label: { fontFamily: kind === 'phone' ? 'var(--mantine-font-family-monospace)' : undefined } }}
    >
      {value}
    </Button>
  );
}
