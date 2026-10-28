import { Box, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** At most one next step — clear filters, create the first item, retry: a filled or outlined button, never a text
   * button (it would read as part of the description). */
  action?: ReactNode;
  /** Icon color — red for load errors (LM3 §24). */
  color?: string;
}

// LM3 §24 — page-level empty state: why it is empty, one line of guidance and at most one next step.
export function EmptyState({ icon: Icon, title, description, action, color }: EmptyStateProps) {
  return (
    <Paper p="xl">
      <Stack align="center" gap="xs" ta="center">
        <ThemeIcon size={48} radius="md" variant="light" color={color}>
          <Icon size={24} />
        </ThemeIcon>
        <Text fw={600}>{title}</Text>
        <Text fz="sm" c="dimmed" maw={320}>
          {description}
        </Text>
        {action && <Box pt="sm">{action}</Box>}
      </Stack>
    </Paper>
  );
}
