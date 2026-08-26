import { useState } from 'react';
import { learningTimeline } from '../data/portfolio';
import SectionReveal from './SectionReveal';
import { motion, useInView } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

const statusIcon = { current: 'solar:bookmark-linear', next: 'solar:arrow-right-linear', exploring: 'solar:magnifer-linear' };
const statusLabel = { current: 'Studying now', next: 'Up next', exploring: 'Exploring' };

// ─── Interactive timeline dot ─────────────────────────────────────────

function TimelineDot({ status }: { status: 'current' | 'next' | 'exploring' }) {
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        scale: isHovered && !reduced ? 1.15 : 1,
        backgroundColor: isHovered ? '#f0ede8' : '#faf9f6',
        borderColor: isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute left-0 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center"
    >
      <motion.div animate={{ scale: isHovered ? 1.1 : 1 }} transition={{ duration: 0.15 }}>
        <Icon icon={statusIcon[status]} width={12} className="text-taupe" />
      </motion.div>
    </motion.div>
  );
}

export default function LearningTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();

  return (
    <section id="learning" ref={ref} className="py-20 md:py-28 border-t border-hairline" aria-label="Learning timeline">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Growth</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-12">Learning Timeline</h2>
        </SectionReveal>

        <div className="max-w-2xl">
          {learningTimeline.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative pl-8 pb-8 last:pb-0"
            >
              {i < learningTimeline.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-hairline" />
              )}
              <TimelineDot status={item.status} />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-charcoal">{item.label}</h3>
                  <span className="text-[10px] text-taupe uppercase tracking-wider">{statusLabel[item.status]}</span>
                </div>
                <p className="text-sm text-stone leading-relaxed">{item.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
