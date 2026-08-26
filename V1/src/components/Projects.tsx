import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { projects, domains, type Domain } from '../data/portfolio';
import CaseStudy from './CaseStudy';
import SectionReveal from './SectionReveal';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive filter pill ──────────────────────────────────────────

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleMV = useMotionValue(1);
  const scale = useSpring(scaleMV, { stiffness: 400, damping: 25 });

  const bgColor = isActive
    ? '#2c2c2c'
    : isPressed ? '#f0ede8' : isHovered ? '#f5f2ed' : 'transparent';

  const textColor = isActive ? '#faf9f6' : isHovered ? '#2c2c2c' : '#8a8580';

  const borderColor = isActive
    ? '#2c2c2c'
    : isFocused ? '#2c2c2c' : isHovered ? '#8a8580' : '#e8e4df';

  return (
    <motion.button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => { scaleMV.set(0.95); setIsPressed(true); }}
      onMouseUp={() => { scaleMV.set(1); setIsPressed(false); }}
      onMouseLeave={() => { scaleMV.set(1); setIsPressed(false); }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ scale: reduced ? 1 : scale, backgroundColor: bgColor, color: textColor, borderColor }}
      animate={{
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c'
          : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-lg border min-h-[36px] outline-none"
    >
      {label}
    </motion.button>
  );
}

export default function Projects() {
  const [activeDomain, setActiveDomain] = useState<Domain>('All');
  const filtered = activeDomain === 'All' ? projects : projects.filter((p) => p.domain === activeDomain);

  return (
    <section id="work" className="py-20 md:py-28" aria-label="Selected work">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Selected Work</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-12">Projects</h2>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter projects by domain">
            {domains.map((domain) => (
              <FilterPill key={domain} label={domain} isActive={activeDomain === domain} onClick={() => setActiveDomain(domain)} />
            ))}
          </div>
        </SectionReveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDomain}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            role="tabpanel"
          >
            {filtered.length > 0 ? (
              filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <CaseStudy project={project} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full py-16 text-center"
              >
                <p className="text-sm text-taupe">No projects in this domain yet.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
