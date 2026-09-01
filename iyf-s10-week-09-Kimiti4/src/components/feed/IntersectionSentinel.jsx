/**
 * J-020: Intersection Sentinel
 *
 * An invisible element that triggers a callback when it enters the viewport.
 * Used for infinite scroll — placed at the bottom of a list to auto-load more.
 */

import { useRef, useEffect } from 'react';

export default function IntersectionSentinel({ onIntersect, disabled = false, rootMargin = '400px' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, disabled, rootMargin]);

  if (disabled) return null;

  return (
    <div
      ref={ref}
      style={{ height: 1, width: '100%' }}
      aria-hidden="true"
    />
  );
}
