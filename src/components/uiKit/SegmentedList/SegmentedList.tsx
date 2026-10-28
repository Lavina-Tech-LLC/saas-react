import type { CSSProperties, ReactNode, Ref } from 'react';

import { List, ListItem } from '@/components/uiKit/List';

import classes from './SegmentedList.module.css';

interface SegmentedListProps {
  'aria-label'?: string;
  /** SegmentedListItem rows, or ListItem rows for the rest of a row's slots (an overline, trailing text, a checkbox,
   *  `onPress`). */
  children: ReactNode;
  /** With `style` and `ref`, where useRowDrag's `listProps` go (a list to reorder). */
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLUListElement>;
}

interface SegmentedListItemProps {
  title: ReactNode;
  description?: ReactNode;
  /** ThemeIcon or Avatar */
  leading?: ReactNode;
  /** Chevron, Switch, Badge or meta text */
  trailing?: ReactNode;
  /** Makes the whole row a button: hover state, keyboard focus */
  onClick?: () => void;
  /** Tonal surface for the chosen row of a single-choice list */
  selected?: boolean;
}

// LM3 §13 — M3 Expressive's segmented list: each row its own tile, with no card around it and no hairlines. For settings
// and short groups of separate items; a long list of one kind (people, files, results) keeps List's standard rows.
export function SegmentedList({ children, className, ...props }: SegmentedListProps) {
  return (
    <List className={[classes.group, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </List>
  );
}

export function SegmentedListItem({
  title,
  description,
  leading,
  trailing,
  onClick,
  selected,
}: SegmentedListItemProps) {
  return (
    <ListItem
      headline={title}
      supportingText={description}
      leading={leading}
      trailing={trailing}
      onClick={onClick}
      selected={selected}
    />
  );
}
