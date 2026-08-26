import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Interactive card with hover/pressed/focus states via Framer Motion.
 * Replaces CSS transition-based card hover effects.
 */

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'learning';
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export default function MotionCard({
  children,
  className = '',
  variant = 'default',
  onClick,
  role,
  tabIndex,
  ariaExpanded,
  ariaControls,
}: MotionCardProps) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isLearning = variant === 'learning';

  // Border color
  const borderColor = isFocused
    ? '#2c2c2c'
    : isHovered
      ? isLearning ? 'rgba(138,133,128,0.35)' : 'rgba(138,133,128,0.4)'
      : '#e8e4df';

  // Background
  const bgColor = isLearning
    ? isPressed ? 'rgba(245,242,237,0.5)' : 'rgba(250,249,246,0.4)'
    : isPressed ? '#f0ede8' : isHovered ? '#fdfbf7' : '#faf9f6';

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      style={{
        borderColor,
        backgroundColor: bgColor,
        y: isPressed ? 1 : 0,
      }}
      animate={{
        scale: isPressed ? 0.99 : 1,
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px rgba(44,44,44,0.3)'
          : isHovered
            ? '0 2px 8px rgba(44,44,44,0.06)'
            : '0 0 0 0px transparent',
      }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`border rounded-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
