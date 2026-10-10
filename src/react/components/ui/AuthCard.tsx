import { Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface AuthCardProps {
  title?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}

// LM3 §13 — bordered card, no shadow; the frame for every sign-in screen
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Paper p={{ base: 'lg', sm: 'xl' }} withBorder w="100%" maw={440} mx="auto">
      <Stack gap="lg">
        {title && (
          <Stack gap={4} ta="center">
            <Title order={3}>{title}</Title>
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
