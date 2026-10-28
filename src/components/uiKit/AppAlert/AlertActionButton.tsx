import { Button, type MantineColor } from '@mantine/core';

import type { AlertAction } from './severity';

// LM3 §24 — the action of an AppAlert or AnnouncementBar: a compact text button in the severity's ink, so it reads on
// the tonal box in both schemes
export function AlertActionButton({ action, color }: { action: AlertAction; color: MantineColor }) {
  const Icon = action.icon;
  return (
    <Button
      variant="subtle"
      size="compact-sm"
      color={color}
      fw={600}
      leftSection={Icon ? <Icon size={16} /> : undefined}
      onClick={action.onClick}
      style={{ flexShrink: 0 }}
    >
      {action.label}
    </Button>
  );
}
