import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Icon } from '@iconify/react';
import { personal } from '../data/portfolio';
import useReducedMotion from '../hooks/useReducedMotion';

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Principles', href: '#principles' },
  { label: 'Learning', href: '#learning' },
  { label: 'Contact', href: '#contact' },
];

// ─── Interactive nav link with hover/pressed/focus states ─────────────

function NavLink({ label, href }: { label: string; href: string }) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 500, damping: 28 });

  return (
    <motion.a
      href={href}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => { scaleMV.set(0.94); setIsPressed(true); }}
      onMouseUp={() => { scaleMV.set(1); setIsPressed(false); }}
      onMouseLeave={() => { scaleMV.set(1); setIsPressed(false); }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ scale: reduced ? 1 : scale }}
      animate={{
        color: isPressed ? '#2c2c2c' : isHovered ? '#2c2c2c' : '#8a8580',
        boxShadow: isFocused ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c' : '0 0 0 0px transparent',
        y: isHovered && !reduced ? -1 : 0,
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="text-[13px] font-medium tracking-wide uppercase outline-none min-h-[44px] min-w-[44px] flex items-center justify-center px-1"
    >
      {label}
    </motion.a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navAnim = reduced ? {} : {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  };

  // Mobile toggle button states
  const [toggleHovered, setToggleHovered] = useState(false);
  const [togglePressed, setTogglePressed] = useState(false);
  const toggleScaleMV = useMotionValue(1);
  const toggleScale = useSpring(toggleScaleMV, { stiffness: 400, damping: 25 });

  return (
    <>
      <motion.header
        {...navAnim}
        animate={{
          y: 0,
          opacity: 1,
          backgroundColor: scrolled ? 'rgba(250,249,246,0.95)' : 'rgba(250,249,246,0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          borderBottomColor: scrolled ? '#e8e4df' : 'rgba(232,228,223,0)',
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{ borderBottomWidth: 1 }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Primary navigation">
          <motion.a
            href="#"
            className="text-sm font-semibold text-charcoal tracking-wide outline-none"
            whileHover={{ color: '#8a8580' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {personal.name.split(' ')[0]}
          </motion.a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map((link) => (
              <li key={link.href}><NavLink label={link.label} href={link.href} /></li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <motion.button
            className="md:hidden p-2 -mr-2 text-charcoal outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onHoverStart={() => setToggleHovered(true)}
            onHoverEnd={() => setToggleHovered(false)}
            onMouseDown={() => { toggleScaleMV.set(0.9); setTogglePressed(true); }}
            onMouseUp={() => { toggleScaleMV.set(1); setTogglePressed(false); }}
            onMouseLeave={() => { toggleScaleMV.set(1); setTogglePressed(false); }}
            style={{ scale: reduced ? 1 : toggleScale, color: togglePressed ? '#555049' : toggleHovered ? '#8a8580' : '#2c2c2c' }}
            animate={{
              rotate: mobileOpen ? 90 : 0,
            }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Icon icon={mobileOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'} width={22} />
          </motion.button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="fixed inset-0 z-50 bg-ivory/[0.98] backdrop-blur-lg md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={reduced ? {} : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const }}
                  onClick={() => setMobileOpen(false)}
                  whileHover={{ scale: 1.05, color: '#8a8580' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-2xl font-medium text-charcoal tracking-wide outline-none"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.button
                initial={reduced ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(false)}
                className="mt-4 p-2 text-stone outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <Icon icon="solar:close-circle-linear" width={28} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
