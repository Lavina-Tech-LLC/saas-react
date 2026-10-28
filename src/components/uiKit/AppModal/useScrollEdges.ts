import { useEffect, useState } from 'react';

export interface ScrollEdges {
  /** Content is scrolled out of view above. */
  above: boolean;
  /** More content waits below the view. */
  below: boolean;
}

const NONE: ScrollEdges = { above: false, below: false };

/**
 * Whether a scroller has content hidden above and below its view (M3's scrolling dialog). Follows scrolling and size
 * changes of the scroller and its content. Pass the returned callback as the scroller's ref.
 */
export function useScrollEdges<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>(NONE);

  useEffect(() => {
    if (!node) return;
    const update = () => {
      const above = node.scrollTop > 0;
      const below = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
      setEdges((current) => (current.above === above && current.below === below ? current : { above, below }));
    };
    update();
    node.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    for (const child of node.children) observer.observe(child);
    return () => {
      node.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [node]);

  return [setNode, edges] as const;
}
