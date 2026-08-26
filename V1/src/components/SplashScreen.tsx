import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personal } from '../data/portfolio';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Splash Screen ────────────────────────────────────────────────────
// A premium editorial splash that establishes brand presence.
//
// Sequence (all Framer Motion, zero CSS transitions):
//   0.0s  – Ivory backdrop fades in
//   0.2s  – Monogram circle draws in (scale + opacity)
//   0.5s  – First name reveals (clip-path y)
//   0.7s  – Last name reveals (clip-path y, staggered)
//   1.0s  – Role tagline fades in
//   1.3s  – Hairline divider draws left→right
//   1.6s  – "Entering" indicator fades in
//   2.4s  – Everything dissolves out (staggered)
//   2.8s  – Splash unmounts, main content revealed
//
// Reduced motion: instant show, 0.4s hold, instant hide.

interface SplashScreenProps {
  onComplete: () => void;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  // Auto-advance through phases
  useEffect(() => {
    if (reduced) {
      const t1 = setTimeout(() => setPhase('exit'), 400);
      return () => clearTimeout(t1);
    }
    const t1 = setTimeout(() => setPhase('hold'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  // Call onComplete after exit animation finishes
  const handleExitComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Split name
  const nameParts = personal.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Timing offsets (seconds from start)
  const t = reduced
    ? { mono: 0, first: 0, last: 0, role: 0, line: 0, indicator: 0 }
    : { mono: 0.15, first: 0.45, last: 0.6, role: 0.9, line: 1.2, indicator: 1.5 };

  const exitDelay = reduced ? 0 : 0;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {phase !== 'exit' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: '#faf9f6' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
        >
          {/* Subtle dot grid background */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #2c2c2c 0.5px, transparent 0.5px)',
              backgroundSize: '32px 32px',
              opacity: 0.025,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.8 }}
          />

          <div className="relative flex flex-col items-center text-center px-6">

            {/* Monogram — large, centered */}
            <motion.div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border flex items-center justify-center mb-8"
              style={{ borderColor: '#e8e4df', backgroundColor: '#f5f2ed' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.7, delay: t.mono, ease: EASE }}
            >
              <motion.span
                className="text-3xl sm:text-4xl font-semibold"
                style={{ color: '#2c2c2c' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.3, delay: t.mono + 0.2 }}
              >
                {personal.initials}
              </motion.span>
            </motion.div>

            {/* First name */}
            <motion.div
              className="overflow-hidden mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-none"
                style={{ color: '#2c2c2c' }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: reduced ? 0 : 0.6, delay: t.first, ease: EASE }}
              >
                {firstName}
              </motion.h1>
            </motion.div>

            {/* Last name */}
            <motion.div
              className="overflow-hidden mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-none"
                style={{ color: '#2c2c2c' }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: reduced ? 0 : 0.6, delay: t.last, ease: EASE }}
              >
                {lastName}
              </motion.h1>
            </motion.div>

            {/* Hairline divider — draws left to right */}
            <motion.div
              className="w-16 h-px mb-6 origin-left"
              style={{ backgroundColor: '#e8e4df' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{
                scaleX: { duration: reduced ? 0 : 0.6, delay: t.line, ease: EASE },
                opacity: { duration: reduced ? 0 : 0.3, delay: t.line },
              }}
            />

            {/* Role tagline */}
            <motion.p
              className="text-sm sm:text-base tracking-wide mb-2"
              style={{ color: '#8a8580' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: t.role, ease: EASE }}
            >
              {personal.role}
            </motion.p>

            {/* Location/context */}
            <motion.p
              className="text-xs tracking-widest uppercase mb-10"
              style={{ color: '#8a8580', opacity: 0.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: t.role + 0.15, ease: EASE }}
            >
              {personal.tagline}
            </motion.p>

            {/* Entering indicator — subtle animated dots */}
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.3, delay: t.indicator, ease: EASE }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#8a8580' }}
                  animate={reduced ? {} : {
                    opacity: [0.2, 0.7, 0.2],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom edge line — draws across */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px origin-left"
            style={{ backgroundColor: '#e8e4df' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: reduced ? 0 : 1.8, delay: 0.3, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
