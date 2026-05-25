import { useEffect, useRef } from 'react';

/**
 * Magnetic pointer pull — element drifts toward the cursor when hovered.
 * Disabled on touch devices and when reduced-motion is requested.
 *
 * Strength is the maximum pixel offset at the edge of the element bounds.
 */
export function useMagnetic<T extends HTMLElement>(strength = 14) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (reduced || isTouch) return;

    let raf = 0;
    const setT = (x: number, y: number) => {
      el.style.setProperty('--mag-x', `${x.toFixed(2)}px`);
      el.style.setProperty('--mag-y', `${y.toFixed(2)}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setT(dx * strength, dy * strength));
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setT(0, 0));
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
