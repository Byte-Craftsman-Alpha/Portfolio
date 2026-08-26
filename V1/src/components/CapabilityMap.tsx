import { useState } from 'react';
import { capabilities } from '../data/portfolio';
import SectionReveal from './SectionReveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Interactive skill tag ────────────────────────────────────────────

function SkillTag({ item, isLearning }: { item: string; isLearning: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const reduced = useReducedMotion();

  const bgColor = isLearning
    ? isPressed ? '#e8e4df' : isHovered ? '#f0ede8' : '#f5f2ed'
    : isPressed ? '#e8e4df' : isHovered ? '#f0ede8' : '#f5f2ed';

  const borderColor = isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df';

  return (
    <motion.span
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{ backgroundColor: bgColor, borderColor }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        y: isHovered && !reduced ? -1 : 0,
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="inline-flex px-3 py-1.5 text-xs font-medium rounded-lg border cursor-default"
    >
      <span className={isLearning ? 'text-taupe' : 'text-graphite'}>{item}</span>
    </motion.span>
  );
}

export default function CapabilityMap() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();

  return (
    <section id="capabilities" ref={ref} className="py-20 md:py-28 border-t border-hairline" aria-label="Capabilities">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-12">Skill Map</h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.category}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              className="group"
            >
              <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-4">{cap.category}</p>
              <div className="flex flex-wrap gap-2">
                {cap.items.map((item) => (
                  <SkillTag key={item} item={item} isLearning={cap.category === 'Learning'} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
