import type { MantineSize } from '@mantine/core';
import { useId, useMemo, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from 'react';

import classes from './List.module.css';
import { ListContext, type ListDividers } from './listContext';

interface ListProps {
  /** ListItem elements. */
  children: ReactNode;
  /** Hairlines between the rows: `inset` (from the text, M3's inset divider) or `full`. Default: none. */
  dividers?: ListDividers;
  /** A line joins the rows' leading tiles (an activity history); replaces `dividers`. */
  connected?: boolean;
  /** Section heading over the rows (M3 list subheader, e.g. "Today") — it also names the list. */
  subheader?: ReactNode;
  /** The rows' size, xs (dense) to xl (comfortable); md is M3's 56px one-line row. */
  size?: MantineSize;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
  /** The `ul`: with `className` and `style`, a list without a subheader takes useRowDrag's `listProps`. */
  ref?: Ref<HTMLUListElement>;
}

// Rows the arrow keys move between: a row that is itself a button or link (not one that only holds controls)
const FOCUSABLE_ROWS = ':scope > li > [data-interactive]:not([data-disabled], :disabled)';
const KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

// Up / Down (Home / End) move focus between the rows of a list of button or link rows, as in an M3 list; Tab still
// visits each row, and a key pressed in a row's own control (a switch, a menu) is left alone
function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
  if (!KEYS.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_ROWS)];
  const index = rows.findIndex((row) => row === event.target);
  if (index === -1) return;
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? rows.length - 1
        : Math.min(Math.max(index + (event.key === 'ArrowDown' ? 1 : -1), 0), rows.length - 1);
  event.preventDefault();
  rows[next].focus();
}

// LM3 §13 — an M3 list. Several Lists in one card are its sections: a hairline between them when they have dividers,
// space otherwise.
export function List({
  children,
  dividers: dividersProp,
  connected,
  subheader,
  size = 'md',
  className,
  style,
  ref,
  ...aria
}: ListProps) {
  const id = useId();
  const dividers = connected ? undefined : dividersProp;
  const context = useMemo(() => ({ size, dividers }), [size, dividers]);
  const subheaderId = subheader && !aria['aria-label'] ? `${id}-subheader` : undefined;
  const common = { 'data-size': size, 'data-dividers': dividers, 'data-connected': connected || undefined };
  const list = (
    <ul
      ref={ref}
      role="list"
      className={[classes.list, subheader ? undefined : classes.section, subheader ? undefined : className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-labelledby={subheaderId}
      onKeyDown={moveFocus}
      {...common}
      {...aria}
    >
      {children}
    </ul>
  );

  return (
    <ListContext value={context}>
      {subheader ? (
        <div className={[classes.section, className].filter(Boolean).join(' ')} {...common}>
          <div id={subheaderId} className={classes.subheader}>
            {subheader}
          </div>
          {list}
        </div>
      ) : (
        list
      )}
    </ListContext>
  );
}
