import { useRef, useCallback } from 'react';

export default function useSwipeGesture(onSwipeLeft, onSwipeRight, threshold = 60) {
  const startX   = useRef(null);
  const startY   = useRef(null);
  const active   = useRef(false);
  const blocked  = useRef(false);

  const onTouchStart = useCallback((e) => {
    // Block swipe if touch starts on an interactive or scrollable element
    const target = e.target;
    const blocked_tags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];

    // Check tag name
    if (blocked_tags.includes(target.tagName)) {
      blocked.current = true;
      return;
    }

    // Check if inside a leaflet map container (has .leaflet-container ancestor)
    let el = target;
    while (el) {
      if (
        el.classList?.contains('leaflet-container') ||
        el.classList?.contains('leaflet-pane') ||
        el.classList?.contains('map-dark') ||
        el.classList?.contains('map-light') ||
        el.getAttribute?.('data-noswipe') === 'true'
      ) {
        blocked.current = true;
        return;
      }
      el = el.parentElement;
    }

    blocked.current  = false;
    active.current   = true;
    startX.current   = e.touches[0].clientX;
    startY.current   = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!active.current || blocked.current || startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // If mostly vertical — it's a scroll, cancel swipe
    if (Math.abs(dy) > Math.abs(dx) * 1.2) {
      active.current = false;
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!active.current || blocked.current || startX.current == null) {
      active.current  = false;
      blocked.current = false;
      return;
    }
    active.current = false;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    // Only fire if clearly horizontal and long enough
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx) * 0.8) {
      startX.current = null;
      return;
    }

    if (dx < 0) onSwipeLeft?.();
    else        onSwipeRight?.();

    startX.current = null;
    startY.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
