import { useState, useEffect, useRef } from 'react';

export default function usePullToRefresh(onRefresh, enabled = true) {
  const [pulling,   setPulling]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY  = useRef(0);
  const pulling_ = useRef(false);
  const THRESHOLD = 72; // px to pull before triggering

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e) => {
      // Only trigger if at top of page
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      pulling_.current = true;
    };

    const onTouchMove = (e) => {
      if (!pulling_.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 10 && window.scrollY === 0) {
        setPulling(dy > THRESHOLD);
        // Suppress default scroll bounce on iOS
        if (dy > 0) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (!pulling_.current) return;
      pulling_.current = false;
      if (pulling) {
        setPulling(false);
        setRefreshing(true);
        try { await onRefresh(); } catch {}
        setRefreshing(false);
      } else {
        setPulling(false);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false });
    document.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove',  onTouchMove);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, [enabled, pulling, onRefresh]);

  return { pulling, refreshing };
}
