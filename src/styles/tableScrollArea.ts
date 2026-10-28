import type { ScrollAreaProps } from '@mantine/core';

// A table's sideways scrollbar (LM3 §14), thick enough to grab with a mouse; 'present' reserves its room only while it
// shows. Never vertical: the page is the one scroller. TableScroll passes these again with its own viewport props,
// which replace the theme's object as a whole.
export const TABLE_SCROLL_AREA = {
  type: 'auto',
  scrollbars: 'x',
  scrollbarSize: 12,
  offsetScrollbars: 'present',
} as const satisfies ScrollAreaProps;
