import { Group, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title?: string;
  icon?: ReactNode;
  /** Right side of the title row (e.g. a create button). */
  action?: ReactNode;
  children: ReactNode;
}

// LM3 §14 section pattern: title + action on a row above, then the content's own surfaces (a table's Paper, a form) —
// never a card wrapped around a card
export function SettingsSection({ title, icon, action, children }: SettingsSectionProps) {
  return (
    <Stack gap="sm">
      {(title || action) && (
        <Group justify="space-between" align="end" wrap="nowrap">
          {title && (
            <Group gap="xs" wrap="nowrap">
              {icon}
              <Title order={5}>{title}</Title>
            </Group>
          )}
          {action}
        </Group>
      )}
      {children}
    </Stack>
  );
}
