import { useRef, useState, type PointerEvent } from 'react';

const MIN_DISTANCE = 80; // px — a shorter drag always springs back unless it is a flick
const FLICK_SPEED = 0.5; // px/ms

interface DragStart {
  y: number;
  time: number;
  height: number;
}

/**
 * Swipe-down-to-close for a bottom sheet: spread `handlers` on the drag area, translate the sheet by `offset` and drop
 * the transition while `dragging`. Released past `threshold` of its height (at least 80px) or flicked, it calls
 * `onClose`; otherwise it springs back. Call `reset` once the sheet has closed.
 */
export function useSwipeToClose(onClose: () => void, threshold = 0.3) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<DragStart | null>(null);

  const distance = (e: PointerEvent<HTMLElement>) => Math.max(0, e.clientY - (start.current?.y ?? e.clientY));

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    const sheet = e.currentTarget.closest<HTMLElement>('[data-sheet]');
    start.current = { y: e.clientY, time: e.timeStamp, height: sheet?.offsetHeight ?? 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (start.current) setOffset(distance(e));
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const dy = distance(e);
    const speed = dy / Math.max(1, e.timeStamp - start.current.time);
    const farEnough = dy > Math.max(MIN_DISTANCE, start.current.height * threshold);
    start.current = null;
    setDragging(false);
    if (farEnough || (dy > 0 && speed > FLICK_SPEED)) onClose();
    else setOffset(0);
  };

  return {
    offset,
    dragging,
    reset: () => setOffset(0),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
