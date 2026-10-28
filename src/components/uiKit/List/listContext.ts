import type { MantineSize } from '@mantine/core';
import { createContext, useContext } from 'react';

// LM3 §13 — shared by List, ListItem and the option lists built from list rows

/** Hairlines between rows: `inset` starts where the text starts (after the leading slot), `full` spans the row. */
export type ListDividers = 'inset' | 'full';

/** What the leading slot holds — it sizes the slot (M3 list item at md: icon 24, avatar 40, image 56, video 114×64). */
export type ListLeadingType = 'icon' | 'avatar' | 'image' | 'video' | 'control';

export interface ListContextValue {
  size: MantineSize;
  dividers?: ListDividers;
}

/** Set by List: its rows render as list items (`li`) and take its size. */
export const ListContext = createContext<ListContextValue | null>(null);

export const useListContext = () => useContext(ListContext);

/** One-line row height per size (M3: 56 at md, the 48 of a menu item at sm); two lines add 16px, three lines 32px. */
export const LIST_ROW_HEIGHT: Record<MantineSize, number> = { xs: 40, sm: 48, md: 56, lg: 64, xl: 72 };
