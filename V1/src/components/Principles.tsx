import { useState } from 'react';
import { principles } from '../data/portfolio';
import SectionReveal from './SectionReveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive principle card ───────────────────────────────────────

function PrincipleCard({ title, description, delay, isInView }: {
  title: string; description: string; delay: number; isInView: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduced = useReducedMotion();

  const borderColor = isFocused ? 'rgba(44,44,44,0.4)' : isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df';
  const bgColor = isPressed ? '#f0ede8' : isHovered ? '#fdfbf7' : '#faf9f6';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? {
        opacity: 1, y: 0,
        scale: isPressed ? 0.99 : 1,
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px rgba(44,44,44,0.25)'
          : isHovered ? '0 4px 12px rgba(44,44,44,0.06)' : '0 0 0 0px transparent',
      } : {}}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      style={{ borderColor, backgroundColor: bgColor, y: isPressed ? 1 : 0 }}
      className="p-6 border rounded-xl outline-none cursor-default"
    >
      <motion.h3
        className="text-base font-semibold text-charcoal mb-3"
        animate={{ x: isHovered && !reduced ? 2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>
      <p className="text-sm text-stone leading-relaxed">{description}</p>
    </motion.article>
  );
}

export default function Principles() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section id="principles" ref={ref} className="py-20 md:py-28 border-t border-hairline" aria-label="Engineering principles">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Philosophy</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-12">Engineering Principles</h2>
        </SectionReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, i) => (
            <PrincipleCard key={principle.title} title={principle.title} description={principle.description} delay={i * 0.08} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
