import type { ReactNode } from 'react';
import './Marquee.css';

interface Props {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite horizontal marquee. Children are rendered twice for a seamless loop.
 * Pure CSS animation — pauses on hover, respects prefers-reduced-motion.
 */
export default function Marquee({ children, speed = 40, reverse = false, className }: Props) {
  return (
    <div className={`marquee ${className ?? ''}`} aria-hidden="true">
      <div
        className={`marquee__track ${reverse ? 'marquee__track--rev' : ''}`}
        style={{ ['--marquee-duration' as never]: `${speed}s` }}
      >
        <div className="marquee__row">{children}</div>
        <div className="marquee__row" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
