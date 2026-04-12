import { useRef, useCallback } from 'react';

export default function useSwipeGesture(onSwipeLeft, onSwipeRight, threshold = 60) {
  const startX  = useRef(null);
  const startY  = useRef(null);
  const active  = useRef(false);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    active.current = true;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!active.current || startX.current == null) return;
    active.current = false;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    // Only fire if horizontal swipe dominates (not scrolling)
    if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx < 0) onSwipeLeft?.();
    else        onSwipeRight?.();

    startX.current = null;
    startY.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  const onTouchMove = useCallback((e) => {
    if (!active.current || startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // If mostly horizontal — prevent vertical scroll hijack
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 20) {
      // don't preventDefault here — let it be passive for perf
    }
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
