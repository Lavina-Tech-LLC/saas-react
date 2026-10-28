import { useEffect, useRef } from 'react';

/** The nearest ancestor that can scroll vertically, or the document. */
function verticalScroller(start: HTMLElement | null): HTMLElement | null {
  for (let node = start; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
}

/**
 * For a sideways scroller (a wide table, a tab row): mostly-vertical wheel and trackpad gestures scroll the page
 * instead. Browsers latch a whole gesture to the first scroller that can take any of it, so a slightly diagonal swipe
 * would otherwise stop the page. Pinch zoom (ctrl + wheel) and a scroller that also scrolls vertically keep the gesture.
 */
export function useVerticalWheelPassThrough<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (element.scrollHeight > element.clientHeight) return;
      const page = verticalScroller(element.parentElement);
      if (!page) return;
      event.preventDefault();
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? page.clientHeight
          : event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : 1;
      page.scrollBy({ top: event.deltaY * unit });
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);
  return ref;
}
