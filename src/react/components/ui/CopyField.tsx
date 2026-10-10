import { ActionIcon, CopyButton, Group, TextInput, Tooltip } from '@mantine/core';
import { Check, Copy } from 'lucide-react';

import { useT } from '../../context';

// Read-only monospace value with a copy button (invite links, API keys)
export function CopyField({ value, copyLabel }: { value: string; copyLabel: string }) {
  const t = useT();
  return (
    <Group gap="xs" wrap="nowrap">
      <TextInput
        flex={1}
        readOnly
        value={value}
        ff="monospace"
        size="xs"
        onFocus={(e) => e.currentTarget.select()}
        aria-label={copyLabel}
      />
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t('common.copied') : copyLabel} withArrow>
            <ActionIcon variant="default" size="lg" onClick={copy} aria-label={copyLabel}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
