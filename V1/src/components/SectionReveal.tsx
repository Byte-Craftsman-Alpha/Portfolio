import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Section reveal with buttery blur-scale entrance.
 *
 * Elements start slightly blurred + scaled down + shifted,
 * then smoothly unblur and settle into place on scroll.
 * All Framer Motion — zero CSS transitions.
 */

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionReveal({ children, className = '', delay = 0 }: SectionRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.98, filter: 'blur(6px)' }}
      animate={isInView
        ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
        : { opacity: 0, y: 16, scale: 0.98, filter: 'blur(6px)' }
      }
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
