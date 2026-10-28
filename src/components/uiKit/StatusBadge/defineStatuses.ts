import type { MantineColor } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

/** How one status looks (LM3 §22): its color and icon. */
export interface StatusStyle {
  color: MantineColor;
  icon: LucideIcon;
}

// Typed status → style map for <StatusBadge {...MAP[status]}>: a wrong color or a missing status fails the type check
export const defineStatuses = <K extends string>(map: Record<K, StatusStyle>) => map;
