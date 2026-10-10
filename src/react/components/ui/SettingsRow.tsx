import { Box, Flex, Group, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SettingsRowProps {
  /** Leading icon — every row has one, in a tinted circle of `color`. */
  icon: LucideIcon;
  /** Icon tint by meaning (LM3 §13); danger rows are always red. Default: the primary color. */
  color?: MantineColor;
  label: string;
  description?: ReactNode;
  /** Current value, shown next to the label (below it on phones). */
  value?: ReactNode;
  /** Right-aligned action — usually one small button. */
  action?: ReactNode;
  /** Destructive row: the label turns red. */
  danger?: boolean;
}

// One setting: coloured icon, then label + description, value beside it, action on the right. Stacks label over value on phones.
export function SettingsRow({ icon: Icon, color, label, description, value, action, danger }: SettingsRowProps) {
  return (
    <Group px="md" py="sm" mih={56} gap="md" wrap="nowrap" justify="space-between">
      <ThemeIcon variant="light" color={danger ? 'red' : color} size={36} radius="xl" style={{ flexShrink: 0 }}>
        <Icon size={18} />
      </ThemeIcon>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: 2, sm: 'md' }}
        align={{ base: 'stretch', sm: 'center' }}
        miw={0}
        flex={1}
      >
        <Box w={{ sm: 180 }} style={{ flexShrink: 0 }}>
          <Text fz="sm" fw={600} c={danger ? 'red' : undefined}>
            {label}
          </Text>
          {description && (
            <Text fz="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
        {value !== undefined && (
          <Box miw={0} flex={1}>
            {typeof value === 'string' ? (
              <Text fz="sm" truncate>
                {value}
              </Text>
            ) : (
              value
            )}
          </Box>
        )}
      </Flex>
      {action && <Box style={{ flexShrink: 0 }}>{action}</Box>}
    </Group>
  );
}
