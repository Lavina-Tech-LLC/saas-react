import { Stack, Text, Title } from '@mantine/core';
import { Children, isValidElement, type ReactNode } from 'react';

import { SegmentedList } from '@/components/uiKit/SegmentedList';
import { HEADING_GAP } from '@/styles/spacing';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  /** SettingsRow elements. */
  children: ReactNode;
}

// LM3 §13 — Android 16 style settings: a heading on the page over a separated list, one tile per SettingsRow
export function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  if (rows.length === 0) return null;

  return (
    <Stack component="section" gap={HEADING_GAP}>
      {title && (
        <div>
          <Title order={2} size="h4">
            {title}
          </Title>
          {description && (
            <Text fz="sm" c="dimmed">
              {description}
            </Text>
          )}
        </div>
      )}
      <SegmentedList aria-label={title}>{rows}</SegmentedList>
    </Stack>
  );
}
