import {
  useMotionValue,
  useTransform,
  animate,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Count-up number that fires once when scrolled into view.
 * Honors `prefers-reduced-motion` by snapping straight to the target.
 */
export default function Counter({
  to,
  from = 0,
  duration = 1.6,
  prefix = '',
  suffix = '',
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const mv = useMotionValue(reduced ? to : from);
  const rounded = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(mv, to, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
    });
    return () => controls.stop();
  }, [inView, to, duration, mv, reduced]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const unsub = rounded.on('change', (v) => { el.textContent = v as string; });
    el.textContent = `${prefix}${reduced ? to : from}${suffix}`;
    return () => unsub();
  }, [rounded, prefix, suffix, reduced, to, from]);

  return <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`} />;
}
