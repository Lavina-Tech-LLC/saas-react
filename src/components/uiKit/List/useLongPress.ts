import { useRef, type MouseEvent, type PointerEvent } from 'react';

const DELAY = 450; // ms a finger rests before it counts as a long press
const SLOP = 10; // px it may drift meanwhile (more is a scroll)

/**
 * Touch screens have no hover and no right click: as in Google Photos and Gmail, a long press with a finger or pen
 * selects. Spread `handlers` on the element; `targetOf` picks what the press is on from the pointerdown (undefined: not
 * a long-press target) and is handed to `onLongPress`. The click a long press ends with must be swallowed — call
 * `consumeClick()` in the click handler (true once, right after a long press).
 */
export function useLongPress<T>(
  onLongPress: (target: T) => void,
  targetOf: (event: PointerEvent<HTMLElement>) => T | undefined,
) {
  const press = useRef<{ timer: number; x: number; y: number } | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };

  return {
    consumeClick: () => {
      const was = fired.current;
      fired.current = false;
      return was;
    },
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse') return;
        const target = targetOf(event);
        if (target === undefined) return;
        cancel();
        fired.current = false;
        const timer = window.setTimeout(() => {
          press.current = null;
          fired.current = true;
          onLongPress(target);
        }, DELAY);
        press.current = { timer, x: event.clientX, y: event.clientY };
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const start = press.current;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP) cancel();
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      // The browser's own long-press menu (save image, select text…) would cover the selection
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        if (fired.current || press.current) event.preventDefault();
      },
    },
  };
}
