import { ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';

import classes from './Dialog.module.css';
import { useScrollEdges } from './useScrollEdges';

interface DialogScrollProps {
  children: ReactNode;
  /** The space around the content inside the scroller (the dialog's or sheet's side insets). */
  className?: string;
  /** Without the line above the actions — for a sheet whose action bar has its own divider. */
  noLineBelow?: boolean;
}

/**
 * LM3 §20 — the scrolling part of a dialog or sheet whose title and actions stay put: a ScrollArea that takes the room
 * between them, with M3's lines under the title once the content has scrolled and above the actions while more is below.
 */
export function DialogScroll({ children, className, noLineBelow }: DialogScrollProps) {
  const [ref, edges] = useScrollEdges<HTMLDivElement>();
  return (
    <ScrollArea
      type="auto"
      scrollbars="y"
      viewportRef={ref}
      classNames={{ root: classes.scroll, viewport: classes.viewport }}
      data-above={edges.above || undefined}
      data-below={(!noLineBelow && edges.below) || undefined}
    >
      <div className={className}>{children}</div>
    </ScrollArea>
  );
}

/** A dialog's `scrollAreaComponent` when it lays out its own DialogScroll (the theme's is a ScrollArea.Autosize). */
export function OwnScroll({ children }: { children?: ReactNode }) {
  return children;
}
