import { useState } from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

interface MonogramProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { outer: 'w-10 h-10', text: 'text-sm' },
  md: { outer: 'w-14 h-14', text: 'text-base' },
  lg: { outer: 'w-20 h-20', text: 'text-xl' },
};

export default function Monogram({ initials, size = 'lg' }: MonogramProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reduced = useReducedMotion();
  const sz = sizeMap[size];

  const borderColor = isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df';
  const bgColor = isPressed ? '#f0ede8' : isHovered ? '#f5f2ed' : '#f5f2ed';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        opacity: 1,
        borderColor,
        backgroundColor: bgColor,
      }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${sz.outer} rounded-full border flex items-center justify-center font-semibold text-charcoal select-none cursor-default outline-none`}
      aria-label={`Monogram for ${initials}`}
    >
      <motion.span
        animate={{ scale: isHovered && !reduced ? 1.05 : 1 }}
        transition={{ duration: 0.15 }}
        className={sz.text}
      >
        {initials}
      </motion.span>
    </motion.div>
  );
}
