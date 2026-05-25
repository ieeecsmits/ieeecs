import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: 'div' | 'section' | 'span' | 'li' | 'article' | 'header' | 'h2' | 'h3';
}

function vector(direction: Direction, distance: number) {
  switch (direction) {
    case 'up':    return { x: 0, y: distance };
    case 'down':  return { x: 0, y: -distance };
    case 'left':  return { x: distance, y: 0 };
    case 'right': return { x: -distance, y: 0 };
    default:      return { x: 0, y: 0 };
  }
}

export default function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  distance = 28,
  direction = 'up',
  className,
  once = true,
  amount = 0.2,
  as = 'div',
}: Props) {
  const reduced = useReducedMotion();
  const offset = vector(direction, distance);

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    show:   { opacity: 1, x: 0, y: 0 },
  };

  const MotionTag = motion[as] as typeof motion.div;

  if (reduced) {
    const Tag = as as 'div';
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </MotionTag>
  );
}
