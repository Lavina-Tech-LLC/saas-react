import { Box } from '@mantine/core';
import type { ReactNode } from 'react';

import { HAIRLINE } from '@/styles/lines';

interface DialogListProps {
  /** A kit `List` — its rows run edge to edge here. */
  children: ReactNode;
  /** Past this height the list scrolls inside the dialog; the title and the actions stay. */
  maxHeight?: number;
}

/**
 * LM3 §20 — the M3 list dialog's list: edge to edge between a hairline under the text and one over the actions,
 * scrolling on its own when it is long.
 */
export function DialogList({ children, maxHeight = 280 }: DialogListProps) {
  return (
    <Box
      mx="calc(var(--mantine-spacing-lg) * -1)"
      mah={maxHeight}
      style={{ overflowY: 'auto', overscrollBehavior: 'contain', borderTop: HAIRLINE, borderBottom: HAIRLINE }}
    >
      {children}
    </Box>
  );
}
