import { ThemeIcon, type MantineColor } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { ListItem } from '@/components/uiKit/List';

import classes from './SettingsRow.module.css';

/** The row's label and description ids, for a Switch in `action`. */
export interface SettingsRowAria {
  'aria-labelledby': string;
  'aria-describedby'?: string;
}

interface SettingsRowProps {
  /** Leading icon — every row has one, in a tonal circle of `color`. */
  icon: LucideIcon;
  /** Icon tint by meaning (LM3 §13); danger rows are always red. Default: the primary color. */
  color?: MantineColor;
  label: string;
  description?: ReactNode;
  /** Current value, shown next to the label (below it on phones). */
  value?: ReactNode;
  /**
   * Right-aligned action — one small button or a Switch. As a function it gets the row's label and description ids, so
   * a Switch is named and described by them: `action={(aria) => <Switch {...aria} />}`.
   */
  action?: ReactNode | ((aria: SettingsRowAria) => ReactNode);
  /** Destructive row: red label and icon. */
  danger?: boolean;
}

// LM3 §13 — one setting in a SettingsGroup, as a list row
export function SettingsRow({ icon: Icon, color, label, description, value, action, danger }: SettingsRowProps) {
  const hasValue = value !== undefined;
  const id = useId();
  const aria: SettingsRowAria = {
    'aria-labelledby': `${id}-label`,
    'aria-describedby': description ? `${id}-description` : undefined,
  };
  const labelText = (
    <span id={aria['aria-labelledby']} className={classes.label}>
      {label}
    </span>
  );

  return (
    <ListItem
      leading={
        <ThemeIcon variant="light" color={danger ? 'red' : color}>
          <Icon />
        </ThemeIcon>
      }
      leadingType="avatar"
      color={danger ? 'red' : undefined}
      // A fixed label column lines values up across rows
      headline={
        hasValue ? (
          <span className={classes.columns}>
            {labelText}
            <span className={classes.value}>{value}</span>
          </span>
        ) : (
          labelText
        )
      }
      supportingText={description && <span id={aria['aria-describedby']}>{description}</span>}
      trailing={action && (typeof action === 'function' ? action(aria) : action)}
      wrapText={hasValue}
    />
  );
}
