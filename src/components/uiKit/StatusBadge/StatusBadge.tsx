import { Badge, type BadgeProps, type MantineSize } from '@mantine/core';
import type { ReactNode } from 'react';

import type { StatusStyle } from './defineStatuses';
import classes from './StatusBadge.module.css';

interface StatusBadgeProps extends StatusStyle, Omit<BadgeProps, 'color' | 'variant' | 'leftSection' | 'children'> {
  children: ReactNode;
}

const BADGE_ICON: Record<MantineSize, number> = { xs: 10, sm: 12, md: 12, lg: 14, xl: 18 };
const CLASSES = { root: classes.badge, label: classes.label };

// LM3 §22 — the one status badge, always with its icon and never cut off. Domain badges are status maps
// (defineStatuses) spread into it.
export function StatusBadge({ color, icon: Icon, size = 'lg', children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      {...props}
      size={size}
      color={color}
      variant="light"
      classNames={CLASSES}
      leftSection={<Icon size={BADGE_ICON[size as MantineSize] ?? BADGE_ICON.lg} aria-hidden />}
    >
      {children}
    </Badge>
  );
}
