import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personal } from '../data/portfolio';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Splash Screen ────────────────────────────────────────────────────
// Premium editorial splash with near-zero-gap blur reveal.
//
// onComplete fires BEFORE the exit animation finishes,
// so content starts unblurring while splash is still dissolving.
// Result: 0-2ms perceptible gap — seamless depth-of-field handoff.

interface SplashScreenProps {
  onComplete: () => void;
}

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const completedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => {
        setPhase('exit');
        if (!completedRef.current) { completedRef.current = true; onComplete(); }
      }, 400);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setPhase('hold'), 60);
    // Start exit at 1.5s
    const t2 = setTimeout(() => setPhase('exit'), 1500);
    // Call onComplete at 1.5s — content begins unblurring WHILE splash exits
    const t3 = setTimeout(() => {
      if (!completedRef.current) { completedRef.current = true; onComplete(); }
    }, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reduced, onComplete]);

  const nameParts = personal.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  const t = reduced
    ? { mono: 0, first: 0, last: 0, role: 0, line: 0, indicator: 0 }
    : { mono: 0.1, first: 0.35, last: 0.48, role: 0.7, line: 0.9, indicator: 1.1 };

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: '#faf9f6' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
          transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
        >
          {/* Dot grid background */}
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
            transition={{ duration: reduced ? 0 : 0.6 }}
          />

          <div className="relative flex flex-col items-center text-center px-6">

            {/* Monogram */}
            <motion.div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border flex items-center justify-center mb-8"
              style={{ borderColor: '#e8e4df', backgroundColor: '#f5f2ed' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.6, delay: t.mono, ease: EASE }}
            >
              <motion.span
                className="text-3xl sm:text-4xl font-semibold"
                style={{ color: '#2c2c2c' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.25, delay: t.mono + 0.15 }}
              >
                {personal.initials}
              </motion.span>
            </motion.div>

            {/* First name */}
            <motion.div className="overflow-hidden mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-none"
                style={{ color: '#2c2c2c' }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: reduced ? 0 : 0.45, delay: t.first, ease: EASE }}
              >
                {firstName}
              </motion.h1>
            </motion.div>

            {/* Last name */}
            <motion.div className="overflow-hidden mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-none"
                style={{ color: '#2c2c2c' }}
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: reduced ? 0 : 0.45, delay: t.last, ease: EASE }}
              >
                {lastName}
              </motion.h1>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-16 h-px mb-6 origin-left"
              style={{ backgroundColor: '#e8e4df' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{
                scaleX: { duration: reduced ? 0 : 0.5, delay: t.line, ease: EASE },
                opacity: { duration: reduced ? 0 : 0.25, delay: t.line },
              }}
            />

            {/* Role */}
            <motion.p
              className="text-sm sm:text-base tracking-wide mb-2"
              style={{ color: '#8a8580' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: t.role, ease: EASE }}
            >
              {personal.role}
            </motion.p>

            {/* Location */}
            <motion.p
              className="text-xs tracking-widest uppercase mb-10"
              style={{ color: '#8a8580', opacity: 0.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.35, delay: t.role + 0.1, ease: EASE }}
            >
              {personal.tagline}
            </motion.p>

            {/* Entering dots */}
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25, delay: t.indicator, ease: EASE }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#8a8580' }}
                  animate={reduced ? {} : { opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom edge line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px origin-left"
            style={{ backgroundColor: '#e8e4df' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: reduced ? 0 : 1.2, delay: 0.2, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
