import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { Project } from '../data/portfolio';
import useReducedMotion from '../hooks/useReducedMotion';

const statusConfig = {
  shipped: { label: 'Shipped', icon: 'solar:check-circle-linear' },
  active: { label: 'Active', icon: 'solar:play-circle-linear' },
  fork: { label: 'Fork', icon: 'solar:copy-linear' },
  experiment: { label: 'Experiment', icon: 'solar:flask-linear' },
  learning: { label: 'Learning', icon: 'solar:book-linear' },
};
const statusStyle = { shipped: 'text-charcoal', active: 'text-charcoal', fork: 'text-taupe', experiment: 'text-taupe', learning: 'text-taupe' };

export default function CaseStudy({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduced = useReducedMotion();
  const status = statusConfig[project.status];

  const borderColor = isFocused ? 'rgba(44,44,44,0.4)' : isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df';

  return (
    <motion.article
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ borderColor, backgroundColor: isHovered ? '#fdfbf7' : '#faf9f6' }}
      animate={{
        boxShadow: isHovered ? '0 2px 8px rgba(44,44,44,0.06)' : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="border rounded-xl overflow-hidden"
    >
      {/* Card header */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`case-${project.id}`}
        whileTap={{ scale: 0.995 }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        animate={{
          backgroundColor: isHovered ? 'rgba(240,237,232,0.3)' : 'transparent',
        }}
        transition={{ duration: 0.15 }}
        className="w-full text-left p-6 md:p-7 outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 focus-visible:ring-inset"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-base font-semibold text-charcoal leading-snug">{project.title}</h3>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-shrink-0 mt-0.5 text-taupe"
          >
            <Icon icon="solar:alt-arrow-down-linear" width={16} />
          </motion.span>
        </div>

        <p className="text-sm text-stone leading-relaxed mb-4">{project.tagline}</p>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider ${statusStyle[project.status]}`}>
            <Icon icon={status.icon} width={12} />{status.label}
          </span>
          <span className="w-px h-3 bg-hairline" aria-hidden="true" />
          <span className="text-[10px] text-taupe uppercase tracking-wider">{project.domain}</span>
        </div>
      </motion.button>

      {/* Expandable case study */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`case-${project.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-7 pb-6 md:pb-7 pt-4 border-t border-hairline">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] text-taupe uppercase tracking-[0.15em] mb-2 font-medium">Problem</p>
                  <p className="text-sm text-stone leading-relaxed">{project.caseStudy.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] text-taupe uppercase tracking-[0.15em] mb-2 font-medium">Role</p>
                  <p className="text-sm text-stone leading-relaxed">{project.caseStudy.role}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-taupe uppercase tracking-[0.15em] mb-2 font-medium">Architecture</p>
                <p className="text-sm text-stone leading-relaxed">{project.caseStudy.architecture}</p>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-taupe uppercase tracking-[0.15em] mb-2 font-medium">Outcome</p>
                <p className="text-sm text-stone leading-relaxed">{project.caseStudy.outcome}</p>
              </div>
              <div className="mb-6">
                <p className="text-[10px] text-taupe uppercase tracking-[0.15em] mb-3 font-medium">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.caseStudy.stack.map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.05, backgroundColor: '#f0ede8' }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex px-2.5 py-1 text-[11px] font-medium text-graphite bg-ivory-deep rounded-md border border-hairline cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-5 pt-2 border-t border-hairline/60">
                <motion.a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 3, color: '#8a8580' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-charcoal min-h-[36px] outline-none"
                  aria-label={`View ${project.title} repository`}
                >
                  <Icon icon="solar:code-square-linear" width={16} />Repository
                </motion.a>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider ${statusStyle[project.status]}`}>
                  <Icon icon={status.icon} width={12} />{status.label}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
