import {
  ActionIcon,
  Tooltip,
  useMantineTheme,
  type ActionIconProps,
  type MantineTheme,
  type PolymorphicComponentProps,
} from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

import { whiteContrast } from '@/styles/m3/contrast';

export type TableActionProps = PolymorphicComponentProps<
  'button',
  Omit<ActionIconProps, 'size' | 'variant' | 'children'>
> & {
  /** The tooltip, and the accessible name unless `aria-label` says more ("More actions for Order #10001"). */
  label: string;
  icon: LucideIcon;
  /** The row's ⋯ menu trigger: the one tonal button among the filled ones. */
  tonal?: boolean;
};

const TOOLTIP_EVENTS = { hover: true, focus: true, touch: false };

/** Space between neighbouring row action buttons — the same in tables, cards and lists. */
export const ACTION_GAP = 6;

// WCAG's minimum for icons and other graphics
const ICON_CONTRAST = 3;

// A filled action's icon is always white: the action's color at the first shade from 7 that a white icon reads on at
// 3:1, else its deepest — so green, lime and yellow deepen a step instead of turning their icon black (autoContrast)
function whiteIconColor(theme: MantineTheme, color: string) {
  const shades = theme.colors[color];
  if (!shades) return color;
  const index = shades.findIndex((shade, i) => i >= 7 && whiteContrast(shade) >= ICON_CONTRAST);
  return `${color}.${index === -1 ? shades.length - 1 : index}`;
}

// LM3 §14 — one row action: a filled icon button in its action's color, named by aria-label + Tooltip. TableActions
// lays several out; use it alone for a single action outside a table.
export function TableAction({ label, icon: Icon, 'aria-label': ariaLabel, tonal, color, ...props }: TableActionProps) {
  const theme = useMantineTheme();
  const filledColor = color && !tonal ? whiteIconColor(theme, color) : color;
  return (
    <Tooltip label={label} events={TOOLTIP_EVENTS}>
      <ActionIcon
        {...props}
        color={filledColor}
        autoContrast={false}
        aria-label={ariaLabel ?? label}
        size="input-xs"
        variant={tonal ? 'light' : 'filled'}
        data-row-action
      >
        <Icon aria-hidden />
      </ActionIcon>
    </Tooltip>
  );
}
