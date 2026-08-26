import { useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Premium interactive button with ALL states handled via Framer Motion:
 *   - default, hover, pressed, focus-visible, disabled, loading, success, error
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'filter';
export type ButtonSize = 'sm' | 'md';

interface MotionButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  'aria-selected'?: boolean;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, { bg: string; bgHover: string; text: string; textHover: string; border: string; borderHover: string }> = {
  primary:   { bg: '#2c2c2c', bgHover: '#444444', text: '#faf9f6', textHover: '#faf9f6', border: '#2c2c2c', borderHover: '#444444' },
  secondary: { bg: '#faf9f6', bgHover: '#f0ede8', text: '#2c2c2c', textHover: '#2c2c2c', border: '#e8e4df', borderHover: '#8a8580' },
  ghost:     { bg: 'transparent', bgHover: 'rgba(44,44,44,0.04)', text: '#8a8580', textHover: '#2c2c2c', border: 'transparent', borderHover: 'transparent' },
  filter:    { bg: '#faf9f6', bgHover: '#f0ede8', text: '#8a8580', textHover: '#2c2c2c', border: '#e8e4df', borderHover: '#8a8580' },
};

const sizeStyles: Record<ButtonSize, { px: string; py: string; text: string; minH: number }> = {
  sm: { px: '0.75rem', py: '0.375rem', text: '10px', minH: 32 },
  md: { px: '1.25rem', py: '0.625rem', text: '14px', minH: 44 },
};

export default function MotionButton({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  isError = false,
  disabled = false,
  icon,
  children,
  className = '',
  onClick,
  role,
  'aria-selected': ariaSelected,
  'aria-label': ariaLabel,
  type = 'button',
}: MotionButtonProps) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isInteractive = !disabled && !isLoading;
  const showSuccess = isSuccess && !isLoading;
  const showError = isError && !isLoading && !isSuccess;

  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 400, damping: 25 });

  const handleHoverStart = () => { if (isInteractive) setIsHovered(true); };
  const handleHoverEnd = () => setIsHovered(false);
  const handlePressStart = () => { if (isInteractive) { setIsPressed(true); scaleMV.set(0.97); } };
  const handlePressEnd = () => { setIsPressed(false); scaleMV.set(1); };

  const bgColor = disabled ? '#e8e4df' : showError ? '#faf9f6' : showSuccess ? vs.bg : isPressed ? vs.bgHover : isHovered ? vs.bgHover : vs.bg;
  const textColor = disabled ? '#c9c3bc' : showError ? '#a04040' : showSuccess ? vs.textHover : isHovered ? vs.textHover : vs.text;
  const borderColor = disabled ? '#e8e4df' : isFocused ? '#2c2c2c' : isHovered ? vs.borderHover : vs.border;

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      role={role}
      aria-selected={ariaSelected}
      aria-label={ariaLabel}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        scale: reduced ? 1 : scale,
        backgroundColor: bgColor,
        color: textColor,
        borderColor,
        paddingLeft: ss.px,
        paddingRight: ss.px,
        paddingTop: ss.py,
        paddingBottom: ss.py,
        fontSize: ss.text,
        minHeight: ss.minH,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      animate={{
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c'
          : isHovered && isInteractive
            ? '0 1px 3px rgba(44,44,44,0.08)'
            : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider rounded-lg border outline-none ${className}`}
    >
      {isLoading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full"
        />
      ) : showSuccess ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>✓</motion.span>
      ) : showError ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>✕</motion.span>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
