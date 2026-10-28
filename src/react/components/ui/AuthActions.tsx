import { Group } from '@mantine/core';
import type { ReactNode } from 'react';

/** A sign-in screen's actions on one line (M3): a quieter way out at the start, the main action, filled, at the end. */
export function AuthActions({ start, children }: { start?: ReactNode; children?: ReactNode }) {
  return (
    <Group justify="space-between" gap="sm" pt="xs">
      <div>{start}</div>
      <Group gap="sm">{children}</Group>
    </Group>
  );
}
