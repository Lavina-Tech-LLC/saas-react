import { Box, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { useBelow } from '@/hooks/useScreen';

interface AuthCardProps {
  title?: string;
  subtitle?: ReactNode;
  /** Under the title: who is signing in (the identity chip), the organization of an invite. */
  aside?: ReactNode;
  children?: ReactNode;
}

/**
 * The frame of every sign-in screen, as the M3 sign-in on Google's: a flat card with 28px corners in the card tone —
 * the title, its line and `aside` on the left, the form on the right (from sm 840; stacked below it). On phones (below
 * xs 600) there is no card: the screen is the page.
 */
export function AuthCard({ title, subtitle, aside, children }: AuthCardProps) {
  const phone = useBelow('xs');
  const body = <Stack gap="lg">{children}</Stack>;
  const content = title ? (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={{ base: 'lg', sm: 48 }}>
      <Stack gap="sm" align="flex-start">
        <Title order={1}>{title}</Title>
        {subtitle && <Text c="dimmed">{subtitle}</Text>}
        {aside}
      </Stack>
      {body}
    </SimpleGrid>
  ) : (
    body
  );

  if (phone) {
    return (
      <Box w="100%" maw={480} mx="auto" py="lg">
        {content}
      </Box>
    );
  }
  return (
    <Paper
      w="100%"
      maw={title ? { base: 480, sm: 1040 } : 480}
      mx="auto"
      p={36}
      radius={28}
      shadow="none"
      withBorder={false}
      // Tiles inside the card (the code channels) step up a tone so they still read on it
      style={{ '--auth-tile-bg': 'var(--m3-surface-container-highest)' }}
    >
      {content}
    </Paper>
  );
}
