import { useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Premium interactive link with ALL states via Framer Motion:
 *   - default, hover, pressed, focus-visible
 */

export type LinkVariant = 'default' | 'cta' | 'subtle';

interface MotionLinkProps {
  variant?: LinkVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

export default function MotionLink({
  variant = 'default',
  icon,
  children,
  className = '',
  href,
  target,
  rel,
  'aria-label': ariaLabel,
}: MotionLinkProps) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 400, damping: 25 });

  const handlePressStart = () => { scaleMV.set(0.97); setIsPressed(true); };
  const handlePressEnd = () => { scaleMV.set(1); setIsPressed(false); };

  const isCTA = variant === 'cta';
  const isSubtle = variant === 'subtle';

  const bgColor = isCTA
    ? isPressed ? '#444444' : isHovered ? '#3a3a3a' : '#2c2c2c'
    : isPressed ? '#f0ede8' : isHovered ? '#f5f2ed' : 'transparent';

  const textColor = isCTA
    ? '#faf9f6'
    : isSubtle
      ? isHovered ? '#2c2c2c' : '#8a8580'
      : isHovered ? '#2c2c2c' : '#555049';

  const borderColor = isCTA
    ? 'transparent'
    : isFocused
      ? '#2c2c2c'
      : isHovered ? '#8a8580' : '#e8e4df';

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        scale: reduced ? 1 : scale,
        backgroundColor: bgColor,
        color: textColor,
        borderColor,
      }}
      animate={{
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c'
          : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`inline-flex items-center gap-2 font-medium rounded-lg border ${isCTA ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'} min-h-[44px] outline-none ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.a>
  );
}
