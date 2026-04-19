import { useRef, useCallback } from 'react';

// Returns true if the element or any ancestor is horizontally scrollable
// with actual overflow content (like the hourly forecast scroll strip)
function isInsideHorizontalScroller(target) {
  let el = target;
  while (el && el !== document.body) {
    // Check for data-noswipe attribute (maps etc.)
    if (el.getAttribute?.('data-noswipe') === 'true') return true;

    // Check for leaflet containers
    if (
      el.classList?.contains('leaflet-container') ||
      el.classList?.contains('leaflet-pane') ||
      el.classList?.contains('map-dark') ||
      el.classList?.contains('map-light')
    ) return true;

    // Check if this element is horizontally scrollable with overflow content
    // scrollWidth > clientWidth means it has horizontal scroll content
    if (el.scrollWidth > el.clientWidth + 2) {
      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') {
        return true;
      }
    }

    el = el.parentElement;
  }
  return false;
}

export default function useSwipeGesture(onSwipeLeft, onSwipeRight, threshold = 70) {
  const startX  = useRef(null);
  const startY  = useRef(null);
  const active  = useRef(false);
  const blocked = useRef(false);

  const onTouchStart = useCallback((e) => {
    const target = e.target;

    // Block on interactive elements
    const BLOCKED_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A', 'RANGE'];
    if (BLOCKED_TAGS.includes(target.tagName)) {
      blocked.current = true;
      return;
    }

    // Block if inside any horizontal scroller or map
    if (isInsideHorizontalScroller(target)) {
      blocked.current = true;
      return;
    }

    blocked.current = false;
    active.current  = true;
    startX.current  = e.touches[0].clientX;
    startY.current  = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!active.current || blocked.current || startX.current == null) return;
    const dx = Math.abs(e.touches[0].clientX - startX.current);
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    // Cancel if user is scrolling vertically
    if (dy > dx * 1.1) {
      active.current = false;
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!active.current || blocked.current || startX.current == null) {
      active.current  = false;
      blocked.current = false;
      startX.current  = null;
      return;
    }
    active.current = false;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    // Must be long enough and clearly more horizontal than vertical
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx) * 0.7) {
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
