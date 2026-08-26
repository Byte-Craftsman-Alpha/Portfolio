import { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Icon } from '@iconify/react';
import { personal } from '../data/portfolio';
import Monogram from './Monogram';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive CTA button with all states ───────────────────────────

function HeroButton({ href, icon, children, variant }: {
  href: string; icon: string; children: string; variant: 'primary' | 'secondary';
}) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 400, damping: 25 });

  const isPrimary = variant === 'primary';

  const bgColor = isPrimary
    ? isPressed ? '#555049' : isHovered ? '#3a3a3a' : '#2c2c2c'
    : isPressed ? '#e8e4df' : isHovered ? '#f0ede8' : '#faf9f6';

  const textColor = isPrimary ? '#faf9f6' : isHovered ? '#2c2c2c' : '#555049';

  const borderColor = isPrimary
    ? 'transparent'
    : isFocused ? '#2c2c2c' : isHovered ? '#8a8580' : '#e8e4df';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => { scaleMV.set(0.97); setIsPressed(true); }}
      onMouseUp={() => { scaleMV.set(1); setIsPressed(false); }}
      onMouseLeave={() => { scaleMV.set(1); setIsPressed(false); }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ scale: reduced ? 1 : scale, backgroundColor: bgColor, color: textColor, borderColor }}
      animate={{
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c'
          : isHovered
            ? isPrimary ? '0 4px 12px rgba(44,44,44,0.2)' : '0 2px 6px rgba(44,44,44,0.06)'
            : '0 0 0 0px transparent',
        y: isHovered && !reduced ? -1 : 0,
      }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={`inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-lg border min-h-[44px] outline-none ${isPrimary ? '' : ''}`}
    >
      <motion.span animate={{ rotate: isHovered ? 15 : 0 }} transition={{ duration: 0.2 }}>
        <Icon icon={icon} width={17} />
      </motion.span>
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const anim = (delay: number) =>
    reduced ? {} : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as const },
    };

  return (
    <section className="relative min-h-[85vh] flex items-center" aria-label="Introduction">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #2c2c2c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12">
          <div className="flex-1 max-w-2xl">
            <motion.div {...anim(0)} className="mb-6">
              <Monogram initials={personal.initials} size="lg" />
            </motion.div>

            <motion.h1 {...anim(0.08)} className="text-4xl sm:text-5xl md:text-6xl font-semibold text-charcoal leading-[1.08] tracking-tight mb-4">
              {personal.name}
            </motion.h1>

            <motion.p {...anim(0.16)} className="text-lg md:text-xl font-medium text-graphite mb-2">
              {personal.role}
            </motion.p>

            <motion.p {...anim(0.2)} className="text-sm text-taupe mb-8 tracking-wide">
              {personal.tagline}
            </motion.p>

            <motion.div {...anim(0.28)} className="w-12 h-px bg-hairline mb-8" aria-hidden="true" />

            <motion.p {...anim(0.32)} className="text-base md:text-lg text-stone leading-relaxed max-w-xl mb-10">
              {personal.valueProposition}
            </motion.p>

            <motion.div {...anim(0.4)} className="flex flex-wrap gap-4">
              <HeroButton href={personal.github} icon="solar:code-square-linear" variant="primary">
                GitHub
              </HeroButton>
              <HeroButton href={personal.linkedin} icon="solar:link-round-linear" variant="secondary">
                LinkedIn
              </HeroButton>
            </motion.div>
          </div>

          {/* Right side: domain labels with staggered entrance */}
          <motion.div {...anim(0.5)} className="hidden lg:flex flex-col items-end gap-1.5 pt-2">
            {['Backend / API', 'Real-Time', 'Automation', 'Computer Vision', 'Civic Tech', 'Healthcare', 'Education', 'Data'].map((d, i) => (
              <motion.span
                key={d}
                initial={reduced ? {} : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.04, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[10px] text-taupe/50 uppercase tracking-[0.15em] font-normal"
              >
                {d}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
