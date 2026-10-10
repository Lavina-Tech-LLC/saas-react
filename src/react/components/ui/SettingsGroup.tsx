import { Box, Stack, Text, Title } from '@mantine/core';
import { Children, isValidElement, type ReactNode } from 'react';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

const OUTER = 'var(--mantine-radius-lg)';
const INNER = 'var(--mantine-radius-xs)';

/** Corner shape by position: large on the group's outside, small where two rows meet. */
const corners = (index: number, count: number) => {
  const top = index === 0 ? OUTER : INNER;
  const bottom = index === count - 1 ? OUTER : INNER;
  return `${top} ${top} ${bottom} ${bottom}`;
};

// LM3 §13 — Google Account style settings: an M3 Expressive separated list — every row its own filled surface,
// 2px apart, large corners outside and small ones where rows meet (inline styles: the SDK ships no CSS)
export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  if (rows.length === 0) return null;

  return (
    <Stack gap="xs">
      {title && (
        <Box>
          <Title order={5}>{title}</Title>
          {description && (
            <Text fz="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
      )}
      <Stack gap={2}>
        {rows.map((row, index) => (
          <Box key={row.key ?? index} bg="var(--m3-surface)" style={{ borderRadius: corners(index, rows.length) }}>
            {row}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
