import { Group, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { HEADING_GAP } from '@/styles/spacing';

interface SettingsBlockProps {
  title: string;
  /** At the end of the heading: the block's one action (Invite, Create link). */
  action?: ReactNode;
  children: ReactNode;
}

/** LM3 §14 — a part of a settings section: its heading on the page (an h2 at h4) with its action, over its card. */
export function SettingsBlock({ title, action, children }: SettingsBlockProps) {
  return (
    <Stack component="section" gap={HEADING_GAP}>
      <Group justify="space-between" wrap="nowrap" gap="sm" mih={40}>
        <Title order={2} size="h4">
          {title}
        </Title>
        {action}
      </Group>
      {children}
    </Stack>
  );
}
