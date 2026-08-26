import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Premium morphing cursor — editorial precision instrument.
 *
 * FIX: The cursor now ALWAYS shows the system cursor as fallback.
 * The custom cursor only hides the system cursor once it's confirmed
 * visible (after first mouse move). This prevents the "no cursor" bug.
 *
 * The effect listener dependencies are stabilized to prevent
 * re-registration bugs.
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

let particleId = 0;

export default function PointerFollower() {
  const reduced = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverLabel, setHoverLabel] = useState('');
  const [clickPulse, setClickPulse] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [rotation, setRotation] = useState(0);
  const lastHoverRef = useRef(false);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(false);

  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);

  const trailX = useSpring(pointerX, { stiffness: 60, damping: 14 });
  const trailY = useSpring(pointerY, { stiffness: 60, damping: 14 });

  const coreX = useSpring(pointerX, { stiffness: 600, damping: 34 });
  const coreY = useSpring(pointerY, { stiffness: 600, damping: 34 });

  // Slow rotation
  useEffect(() => {
    if (reduced || isTouch) return;
    let angle = 0;
    const tick = () => {
      angle += 0.3;
      setRotation(angle % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, isTouch]);

  // Click handler
  const handleClick = useCallback(() => {
    if (reduced) return;
    setClickPulse(true);
    setTimeout(() => setClickPulse(false), 700);

    const px = pointerX.get();
    const py = pointerY.get();
    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      newParticles.push({
        id: ++particleId,
        x: px,
        y: py,
        vx: Math.cos(angle) * (40 + Math.random() * 30),
        vy: Math.sin(angle) * (40 + Math.random() * 30),
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 500);
  }, [reduced, pointerX, pointerY]);

  // Event listeners — registered ONCE with stable refs
  useEffect(() => {
    const touchMQ = window.matchMedia('(pointer: coarse)');
    if (touchMQ.matches) { setIsTouch(true); return; }

    const onPointerMove = (e: PointerEvent) => {
      pointerX.set(e.clientX);
      pointerY.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
        // Add CSS class to <html> to hide system cursor on ALL elements
        document.documentElement.classList.add('custom-cursor-active');
      }
    };
    const onMouseLeave = () => {
      setIsVisible(false);
      document.documentElement.classList.remove('custom-cursor-active');
    };
    const onMouseEnter = () => {
      if (visibleRef.current) {
        setIsVisible(true);
        document.documentElement.classList.add('custom-cursor-active');
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target?.closest('a, button, [role="button"], input, textarea, select, [tabindex]');
      const isInter = !!el;
      lastHoverRef.current = isInter;
      setIsHovering(isInter);

      if (isInter) {
        const tag = el?.tagName?.toLowerCase();
        if (tag === 'a') setHoverLabel('OPEN');
        else if (tag === 'button' || tag === 'input' || tag === 'select') setHoverLabel('CLICK');
        else setHoverLabel('ACT');
      }
    };
    const onMouseOut = () => {
      lastHoverRef.current = false;
      setIsHovering(false);
      setHoverLabel('');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', handleClick);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [pointerX, pointerY, handleClick]); // STABLE — no isVisible dependency

  if (reduced || isTouch) return null;

  const diamondSize = isHovering ? 16 : 11;
  const dotR = isHovering ? 5 : 3;

  return (
    <>
      {/* Layer 1: Trailing dot with ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: trailX, y: trailY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.svg
          width={48} height={48} viewBox="0 0 48 48"
          animate={{
            opacity: isVisible ? 1 : 0,
            scale: isHovering ? 1.3 : 1,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <circle
            cx="24" cy="24" r={isHovering ? 18 : 14}
            fill="none"
            stroke="#2c2c2c"
            strokeWidth={isHovering ? 0.8 : 0.4}
            strokeOpacity={isHovering ? 0.2 : 0.1}
            strokeDasharray={isHovering ? '3 2' : '1 4'}
          />
          <circle cx="24" cy="24" r={dotR} fill="#2c2c2c" fillOpacity={0.35} />
          <circle cx="24" cy="24" r={1.2} fill="#2c2c2c" fillOpacity={0.6} />
        </motion.svg>
      </motion.div>

      {/* Layer 2: Core — rotating diamond + crosshair */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: coreX, y: coreY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.svg
          width={36} height={36} viewBox="0 0 36 36"
          animate={{
            opacity: isVisible ? 1 : 0,
            scale: isHovering ? 1.25 : 1,
          }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <g transform={`rotate(${rotation} 18 18)`}>
            <polygon
              points={`18,${18 - diamondSize / 2} ${18 + diamondSize / 2},18 18,${18 + diamondSize / 2} ${18 - diamondSize / 2},18`}
              fill="#2c2c2c"
              fillOpacity={isHovering ? 0.7 : 0.55}
              stroke="#2c2c2c"
              strokeWidth={0.5}
              strokeOpacity={0.3}
            />
            {[
              [18, 18 - diamondSize / 2 - 3, 18, 18 - diamondSize / 2 - 1],
              [18, 18 + diamondSize / 2 + 1, 18, 18 + diamondSize / 2 + 3],
              [18 - diamondSize / 2 - 3, 18, 18 - diamondSize / 2 - 1, 18],
              [18 + diamondSize / 2 + 1, 18, 18 + diamondSize / 2 + 3, 18],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2c2c2c" strokeWidth={0.6} strokeOpacity={0.4} />
            ))}
          </g>
          <circle cx="18" cy="18" r={isHovering ? 1.5 : 1} fill="#faf9f6" fillOpacity={0.9} />
        </motion.svg>
      </motion.div>

      {/* Layer 3: Click pulse */}
      <AnimatePresence>
        {clickPulse && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9998]"
            style={{ x: coreX, y: coreY, translateX: '-50%', translateY: '-50%' }}
          >
            <motion.div
              initial={{ width: 8, height: 8, opacity: 0.5 }}
              animate={{ width: 72, height: 72, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-full border border-charcoal/30"
              style={{ width: 8, height: 8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 4: Click particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed top-0 left-0 pointer-events-none z-[9998] w-1.5 h-1.5 rounded-full bg-charcoal/40"
            initial={{ x: p.x, y: p.y, opacity: 0.7, scale: 1 }}
            animate={{ x: p.x + p.vx, y: p.y + p.vy, opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ translateX: '-50%', translateY: '-50%' }}
          />
        ))}
      </AnimatePresence>

      {/* Layer 5: Context label */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: trailX, y: trailY }}
      >
        <motion.div
          animate={{ opacity: isVisible && isHovering ? 1 : 0, x: 24, y: -4 }}
          transition={{ duration: 0.15 }}
          className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-[0.12em] text-charcoal/60 bg-ivory/90 border border-charcoal/10"
          style={{ fontFamily: 'Public Sans, system-ui, sans-serif' }}
        >
          {hoverLabel}
        </motion.div>
      </motion.div>
    </>
  );
}
