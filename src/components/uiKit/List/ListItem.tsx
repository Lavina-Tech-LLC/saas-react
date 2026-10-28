import { Box, UnstyledButton, type MantineColor, type MantineSize } from '@mantine/core';
import type { MouseEvent, PointerEvent, ReactNode } from 'react';

import classes from './List.module.css';
import { useListContext, type ListLeadingType } from './listContext';
import { isRowPress } from './rowPress';
import { useLongPress } from './useLongPress';

export interface ListItemProps {
  /** The main line (M3 headline). */
  headline: ReactNode;
  /** A second line under it, dimmed (M3 supporting text). */
  supportingText?: ReactNode;
  /** A small line above the headline (M3 overline). */
  overline?: ReactNode;
  /** The row's height class: 1 (56px at md), 2 (72px) or 3 (88px, the supporting text runs to two lines). Default:
   *  one line, plus one each for the overline and the supporting text. */
  lines?: 1 | 2 | 3;
  /** Icon, avatar, thumbnail or a checkbox / radio before the text. */
  leading?: ReactNode;
  /** What `leading` holds, which sizes its slot: icon 24 · avatar 40 · image 56 · video 114×64 · control (at md). */
  leadingType?: ListLeadingType;
  /** Icon, switch, checkbox or a ⋯ menu button after the text. */
  trailing?: ReactNode;
  /** A short dimmed text at the end — a time, a count (M3 trailing supporting text). */
  trailingText?: ReactNode;
  /** The chosen row, in the selected tone. */
  selected?: boolean;
  disabled?: boolean;
  /** The whole row is a button. Not with controls inside (a button in a button) — use `onPress`. */
  onClick?: () => void;
  /** The row holds its own controls (a switch, a checkbox, a ⋯ menu): a press anywhere else on it runs `onPress`
   *  (rowPress.ts rules). The row is not a tab stop — a control in it is the keyboard path to the same action. */
  onPress?: () => void;
  /** With `onPress`, on touch screens: a long press anywhere but the row's controls (`data-row-controls`) runs it —
   *  selects the row, as in Gmail. The click it ends with is swallowed, so nothing in the row also opens. */
  onLongPress?: () => void;
  /** Render the row as another element — a router link, a combobox option: gets the row's props to spread. */
  renderRoot?: (props: Record<string, unknown>) => ReactNode;
  /** Long text wraps instead of being cut off with "…". */
  wrapText?: boolean;
  /** Tints the headline and a leading icon by meaning (`red` for a destructive row). */
  color?: MantineColor;
  /** Default: the List's size, else md. */
  size?: MantineSize;
  className?: string;
  /** Block content under the row, lined up with its text (a release's notes under its version). */
  children?: ReactNode;
}

const join = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

// A long press counts anywhere on the row but in its controls' own parts (the picture toggle, the ⋯ menu)
const onRowPart = (event: PointerEvent<HTMLElement>) => {
  const control = (event.target as Element).closest('[data-row-controls]');
  return control && event.currentTarget.contains(control) ? undefined : true;
};

// LM3 §13 — the M3 list item. Inside a List it is a list item; on its own (an option list) it is just the row.
export function ListItem({
  headline,
  supportingText,
  overline,
  lines: linesProp,
  leading,
  leadingType = 'icon',
  trailing,
  trailingText,
  selected,
  disabled,
  onClick,
  onPress,
  onLongPress,
  renderRoot,
  wrapText,
  color,
  size: sizeProp,
  className,
  children,
}: ListItemProps) {
  const list = useListContext();
  const size = sizeProp ?? list?.size ?? 'md';
  const lines = linesProp ?? (Math.min(1 + (overline ? 1 : 0) + (supportingText ? 1 : 0), 3) as 1 | 2 | 3);
  const interactive = !!(renderRoot || onClick);
  const longPress = useLongPress(() => onLongPress?.(), onRowPart);

  const content = (
    <>
      {leading && (
        // Decorative next to the headline, except a control (a checkbox or radio is the row's own input)
        <Box
          component="span"
          className={classes.leading}
          data-type={leadingType}
          c={color}
          aria-hidden={leadingType === 'control' ? undefined : true}
        >
          {leading}
        </Box>
      )}
      <span className={classes.body}>
        {overline && <span className={classes.overline}>{overline}</span>}
        <Box component="span" className={classes.headline} c={color}>
          {headline}
        </Box>
        {supportingText && <span className={classes.supporting}>{supportingText}</span>}
      </span>
      {trailingText && <span className={classes.trailingText}>{trailingText}</span>}
      {trailing && <span className={classes.trailing}>{trailing}</span>}
    </>
  );
  const row = {
    className: join(classes.row, (interactive || onPress) && !disabled && 'm3-state-layer', className),
    'data-size': size,
    'data-lines': lines,
    'data-selected': selected || undefined,
    'data-disabled': disabled || undefined,
    'data-wrap': wrapText || undefined,
  };

  let root: ReactNode;
  if (renderRoot) {
    root = renderRoot({ ...row, 'data-interactive': true, 'aria-disabled': disabled || undefined, children: content });
  } else if (onClick) {
    root = (
      <UnstyledButton {...row} data-interactive disabled={disabled} aria-pressed={selected} onClick={onClick}>
        {content}
      </UnstyledButton>
    );
  } else {
    const press = (event: MouseEvent<HTMLDivElement>) => {
      if (onPress && !disabled && isRowPress(event)) onPress();
    };
    // Caught on the way down, so the click after a long press reaches nothing in the row (a link in the headline)
    const afterLongPress = (event: MouseEvent<HTMLDivElement>) => {
      if (!longPress.consumeClick()) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const holdable = onPress && onLongPress && !disabled;
    root = (
      <div
        {...row}
        {...(holdable && longPress.handlers)}
        data-pressable={onPress ? true : undefined}
        onClick={onPress ? press : undefined}
        onClickCapture={holdable ? afterLongPress : undefined}
      >
        {content}
      </div>
    );
  }

  const details = children && <div className={classes.details}>{children}</div>;
  if (!list)
    return (
      <>
        {root}
        {details}
      </>
    );
  return (
    <li className={classes.item} data-size={size} data-leading={leading ? leadingType : undefined}>
      {root}
      {details}
    </li>
  );
}
