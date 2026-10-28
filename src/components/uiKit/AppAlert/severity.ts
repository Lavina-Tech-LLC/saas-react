import type { MantineColor } from '@mantine/core';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

// Shared by AppAlert and AnnouncementBar (LM3 §24): one color and icon per severity

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export const SEVERITY: Record<AlertSeverity, { color: MantineColor; icon: LucideIcon }> = {
  info: { color: 'blue', icon: Info },
  success: { color: 'green', icon: CircleCheck },
  warning: { color: 'yellow', icon: TriangleAlert },
  error: { color: 'red', icon: CircleAlert },
};

/** The one action of an alert or announcement — drawn as a text button in the severity color. */
export interface AlertAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}
