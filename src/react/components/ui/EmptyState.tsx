import { Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { ReactNode } from 'react';

// LM3 §24 — dashed surface ("nothing here yet"), the icon in a soft circle, dimmed guidance
export function EmptyState({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <Paper p="xl" withBorder ta="center" style={{ borderStyle: 'dashed' }}>
      <Stack align="center" gap="xs">
        {icon && (
          <ThemeIcon size={48} radius="xl" variant="light">
            {icon}
          </ThemeIcon>
        )}
        <Text c="dimmed" fz="sm" maw={360}>
          {children}
        </Text>
      </Stack>
    </Paper>
  );
}
