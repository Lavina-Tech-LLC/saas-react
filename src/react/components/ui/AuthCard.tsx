import { Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface AuthCardProps {
  title?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}

// LM3 §13 — the theme's card (card tone, hairline) framing every sign-in screen; the screen's title is the page's h1,
// start-aligned like every dialog title
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Paper p={{ base: 'lg', xs: 'xl' }} w="100%" maw={448} mx="auto">
      <Stack gap="lg">
        {title && (
          <Stack gap={4}>
            <Title order={1} size="h2">
              {title}
            </Title>
            {subtitle && (
              <Text fz="sm" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Stack>
        )}
        {children}
      </Stack>
    </Paper>
  );
}
