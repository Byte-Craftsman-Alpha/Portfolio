import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import useReducedMotion from '../hooks/useReducedMotion';

export default function NotFound() {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const bgColor = isPressed ? '#555049' : isHovered ? '#3a3a3a' : '#2c2c2c';

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center max-w-md"
      >
        <motion.p
          className="text-7xl font-semibold text-charcoal/10 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          404
        </motion.p>
        <Icon icon="solar:map-point-linear" width={40} className="text-taupe mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-charcoal mb-2">Page not found</h1>
        <p className="text-sm text-stone mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <motion.div
          whileTap={{ scale: 0.97 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          animate={{
            backgroundColor: bgColor,
            y: isHovered && !reduced ? -1 : 0,
            boxShadow: isHovered ? '0 4px 12px rgba(44,44,44,0.2)' : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-ivory rounded-lg min-h-[44px] outline-none"
          >
            <motion.span animate={{ x: isHovered ? -3 : 0 }} transition={{ duration: 0.15 }}>
              <Icon icon="solar:arrow-left-linear" width={16} />
            </motion.span>
            Return home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
