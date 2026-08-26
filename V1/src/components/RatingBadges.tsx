import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import useReducedMotion from '../hooks/useReducedMotion';
import SectionReveal from './SectionReveal';

// ─── Inline SVG icons — hardcoded stroke, zero API dependency ─────────
// These three icons use EXPLICIT stroke colors (not currentColor)
// to eliminate any CSS color inheritance issues.

function JsIcon({ color = '#555049' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      {/* Chevrons + slash — the universal code symbol */}
      <polyline points="17 8 20 12 17 16" />
      <line x1="14" y1="4" x2="10" y2="20" />
      <polyline points="7 8 4 12 7 16" />
    </svg>
  );
}

function BootstrapIcon({ color = '#555049' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      {/* 2x2 grid of rounded shapes — UI component layout */}
      <circle cx="7" cy="7" r="3.5" />
      <circle cx="17" cy="17" r="3.5" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function OcrIcon({ color = '#555049' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.5">
      {/* Scan frame with horizontal line — OCR/scan icon */}
      <path d="M8 3H5C3.9 3 3 3.9 3 5V8" />
      <path d="M21 8V5C21 3.9 20.1 3 19 3H16" />
      <path d="M16 21H19C20.1 21 21 20.1 21 19V16" />
      <path d="M3 16V19C3 20.1 3.9 21 5 21H8" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

// ─── Skill icon renderer ──────────────────────────────────────────────
// For js/bootstrap/ocr: renders inline SVG with explicit stroke color.
// For all others: renders Iconify <Icon> with explicit style color.

function SkillIcon({ id, icon, color }: { id: string; icon: string; color: string }) {
  if (id === 'js') return <JsIcon color={color} />;
  if (id === 'bootstrap') return <BootstrapIcon color={color} />;
  if (id === 'ocr') return <OcrIcon color={color} />;
  return <Icon icon={icon} width={24} style={{ color }} />;
}

// ─── Rating badge data ────────────────────────────────────────────────

interface SkillRating {
  id: string;
  label: string;
  level: number;
  maxLevel: number;
  tag: string;
  icon: string;
  description: string;
}

const SKILLS: SkillRating[] = [
  { id: 'python',   label: 'Python',         level: 5, maxLevel: 5, tag: 'Core',      icon: 'solar:code-square-linear',   description: 'Primary language — APIs, automation, data, scripting' },
  { id: 'flask',    label: 'Flask',          level: 4, maxLevel: 5, tag: 'Framework',  icon: 'solar:server-linear',        description: 'REST APIs, WebSocket servers, project backends' },
  { id: 'sqlite',   label: 'SQLite',         level: 4, maxLevel: 5, tag: 'Storage',    icon: 'solar:database-linear',      description: 'Data ingestion, Excel conversion, app storage' },
  { id: 'selenium', label: 'Selenium',       level: 4, maxLevel: 5, tag: 'Automation', icon: 'solar:monitor-linear',       description: 'Browser automation, web testing, scraping suites' },
  { id: 'websocket',label: 'WebSocket',      level: 4, maxLevel: 5, tag: 'Real-Time',  icon: 'solar:bolt-linear',          description: 'LAN messaging, real-time communication apps' },
  { id: 'htmlcss',  label: 'HTML / CSS',     level: 4, maxLevel: 5, tag: 'Markup',     icon: 'solar:document-text-linear', description: 'Responsive interfaces, Bootstrap, Tailwind' },
  { id: 'opencv',   label: 'OpenCV',         level: 3, maxLevel: 5, tag: 'Vision',     icon: 'solar:eye-linear',           description: 'Face detection, image processing, OCR prep' },
  { id: 'js',       label: 'JavaScript',     level: 3, maxLevel: 5, tag: 'Language',   icon: 'solar:code-linear',          description: 'Frontend logic, DOM manipulation, interactivity' },
  { id: 'c',        label: 'C / C++',        level: 3, maxLevel: 5, tag: 'Language',   icon: 'solar:cpu-bolt-linear',      description: 'System fundamentals, algorithms, problem solving' },
  { id: 'bootstrap',label: 'Bootstrap',      level: 3, maxLevel: 5, tag: 'UI',         icon: 'solar:widget-2-linear',      description: 'Rapid UI prototyping, responsive layouts' },
  { id: 'ocr',      label: 'OCR / Identity', level: 3, maxLevel: 5, tag: 'Utility',    icon: 'solar:scanner-linear',       description: 'Document processing, identity verification' },
  { id: 'dart',     label: 'Dart',           level: 2, maxLevel: 5, tag: 'Language',   icon: 'solar:programming-linear',   description: 'Cross-platform exploration, Flutter basics' },
];

const LEARNING: SkillRating[] = [
  { id: 'pytorch',  label: 'PyTorch',           level: 1, maxLevel: 5, tag: 'Learning', icon: 'solar:fire-linear',     description: 'Deep learning, neural networks, model training' },
  { id: 'sysdes',   label: 'System Design',     level: 1, maxLevel: 5, tag: 'Learning', icon: 'solar:chart-linear',    description: 'Scalable architecture, distributed systems' },
  { id: 'devops',   label: 'DevOps',            level: 1, maxLevel: 5, tag: 'Learning', icon: 'solar:settings-linear', description: 'CI/CD, containers, infrastructure automation' },
  { id: 'deploy',   label: 'Deploy Pipelines',  level: 1, maxLevel: 5, tag: 'Learning', icon: 'solar:upload-linear',   description: 'Production deployment, monitoring, reliability' },
];

// ─── Circular Progress Ring ───────────────────────────────────────────

function ProgressRing({ progress, size, strokeWidth, isActive, delay, reduced }: {
  progress: number; size: number; strokeWidth: number;
  isActive: boolean; delay: number; reduced: boolean;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2c2c2c" strokeWidth={strokeWidth} strokeOpacity={0.08} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#2c2c2c" strokeWidth={strokeWidth}
        strokeOpacity={isActive ? 0.7 : 0.45}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={isActive ? { strokeDashoffset: offset } : {}}
        transition={{ duration: reduced ? 0 : 1.0, delay: reduced ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </motion.svg>
  );
}

// ─── Interactive filter pill ──────────────────────────────────────────

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const bgColor = isActive
    ? isPressed ? '#555049' : isHovered ? '#3a3a3a' : '#2c2c2c'
    : isPressed ? '#f0ede8' : isHovered ? '#f5f2ed' : '#faf9f6';
  const textColor = isActive ? '#faf9f6' : isHovered ? '#2c2c2c' : '#8a8580';
  const borderColor = isActive ? '#2c2c2c' : isFocused ? '#2c2c2c' : isHovered ? '#8a8580' : '#e8e4df';

  return (
    <motion.button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ backgroundColor: bgColor, color: textColor, borderColor }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        y: isHovered && !reduced ? -1 : 0,
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px #2c2c2c'
          : isHovered ? '0 1px 4px rgba(44,44,44,0.08)' : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-lg border min-h-[32px] outline-none cursor-pointer"
    >
      {label}
    </motion.button>
  );
}

// ─── Rating Badge ─────────────────────────────────────────────────────

function RatingBadge({ skill, index, isInView, reduced }: {
  skill: SkillRating; index: number; isInView: boolean; reduced: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isLearning = skill.tag === 'Learning';
  const fillPct = (skill.level / skill.maxLevel) * 100;
  const progress = skill.level / skill.maxLevel;
  const baseDelay = index * 0.06;

  const borderColor = isFocused
    ? '#2c2c2c'
    : isHovered
      ? isLearning ? 'rgba(138,133,128,0.35)' : 'rgba(138,133,128,0.4)'
      : '#e8e4df';

  const bgColor = isLearning
    ? isPressed ? 'rgba(240,237,232,0.4)' : 'rgba(250,249,246,0.4)'
    : isPressed ? '#f0ede8' : '#faf9f6';

  // Icon color: explicit, no currentColor inheritance
  const iconColor = isHovered ? '#2c2c2c' : '#555049';

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20, scale: 0.96 }}
      animate={isInView ? {
        opacity: 1, y: 0,
        scale: isPressed ? 0.98 : 1,
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px rgba(44,44,44,0.25)'
          : isHovered ? '0 2px 8px rgba(44,44,44,0.06)' : '0 0 0 0px transparent',
      } : {}}
      transition={{ duration: 0.3, delay: isInView ? baseDelay : 0, ease: [0.25, 0.1, 0.25, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      role="listitem"
      aria-label={`${skill.label}: ${skill.level} out of ${skill.maxLevel}`}
      style={{ borderColor, backgroundColor: bgColor }}
      className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border min-h-[56px] cursor-default outline-none"
    >
      {/* Icon — SEPARATE element, NOT inside the ring overlay */}
      <motion.div
        className="flex-shrink-0 flex items-center justify-center"
        animate={{ scale: isHovered ? 1 : 1 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <SkillIcon id={skill.id} icon={skill.icon} color={iconColor} />
      </motion.div>

      {/* Progress ring + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ProgressRing progress={progress} size={20} strokeWidth={2} isActive={isInView} delay={baseDelay + 0.15} reduced={reduced} />
          <motion.p
            className={`text-sm font-medium leading-tight ${isLearning ? 'text-taupe' : 'text-charcoal'}`}
            animate={{ x: isHovered ? 2 : 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {skill.label}
          </motion.p>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${isLearning ? 'text-taupe/40' : 'text-taupe/60'}`}>
            {skill.tag}
          </span>
        </div>
        {/* Description — always in DOM, visibility toggled */}
        <p
          className="text-[11px] text-stone/70 leading-snug truncate"
          style={{
            visibility: isHovered ? 'visible' : 'hidden',
            opacity: isHovered ? 1 : 0,
            maxHeight: isHovered ? 20 : 0,
          }}
        >
          {skill.description}
        </p>
      </div>

      {/* Rating pips — vertical bars */}
      <div className="flex items-center gap-[3px] flex-shrink-0">
        {Array.from({ length: skill.maxLevel }, (_, i) => {
          const filled = i < skill.level;
          return (
            <motion.div
              key={i}
              initial={reduced ? {} : { scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.35, delay: baseDelay + 0.1 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                transformOrigin: 'bottom',
                backgroundColor: filled
                  ? isLearning
                    ? isHovered ? 'rgba(138,133,128,0.5)' : 'rgba(138,133,128,0.25)'
                    : isHovered ? '#2c2c2c' : '#555049'
                  : '#e8e4df',
              }}
              className="w-[5px] h-4 rounded-[1.5px]"
            />
          );
        })}
      </div>

      {/* Bottom fill bar */}
      <motion.div
        className="absolute left-3 bottom-0 h-[2px] rounded-full"
        style={{ backgroundColor: isLearning ? 'rgba(138,133,128,0.15)' : 'rgba(44,44,44,0.12)' }}
        initial={{ width: '0%' }}
        animate={isInView ? { width: `${fillPct}%` } : {}}
        transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : baseDelay + 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Level number — visibility toggled */}
      <span
        className="absolute top-2 right-3 text-[9px] font-bold text-charcoal/25 tracking-wide"
        style={{ visibility: isHovered ? 'visible' : 'hidden', opacity: isHovered ? 1 : 0 }}
      >
        {skill.level}/{skill.maxLevel}
      </span>
    </motion.div>
  );
}

// ─── Interactive summary category tag ─────────────────────────────────

function CategoryTag({ label }: { label: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.span
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        scale: isHovered && !reduced ? 1 : 1,
        y: isHovered && !reduced ? -1 : 0,
        borderColor: isHovered ? 'rgba(138,133,128,0.4)' : '#e8e4df',
        color: isHovered ? '#555049' : 'rgba(138,133,128,0.5)',
      }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider border rounded-md cursor-default"
      style={{ backgroundColor: '#faf9f6' }}
    >
      {label}
    </motion.span>
  );
}

// ─── Summary Bar ──────────────────────────────────────────────────────

function SummaryBar({ skills, isInView, reduced }: {
  skills: SkillRating[]; isInView: boolean; reduced: boolean;
}) {
  const avgLevel = skills.length > 0 ? skills.reduce((s, k) => s + k.level, 0) / skills.length : 0;
  const categories = [...new Set(skills.map(s => s.tag))];

  return (
    <div className="flex flex-wrap items-center gap-6 px-1 mb-10">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          <ProgressRing progress={avgLevel / 5} size={40} strokeWidth={3} isActive={isInView} delay={0.6} reduced={reduced} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-charcoal/60">
            {avgLevel.toFixed(1)}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-charcoal">Average Proficiency</p>
          <p className="text-[10px] text-taupe/60">across {skills.length} skills</p>
        </div>
      </div>
      <div className="h-6 w-px bg-hairline" />
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <CategoryTag key={cat} label={cat} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export default function RatingBadges() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string>('all');

  const allSkills = [...SKILLS, ...LEARNING];
  const categories = ['all', ...new Set(allSkills.map(s => s.tag.toLowerCase()))];

  const filteredSkills = filter === 'all' ? SKILLS : SKILLS.filter(s => s.tag.toLowerCase() === filter);
  const filteredLearning = filter === 'all' ? LEARNING : LEARNING.filter(s => s.tag.toLowerCase() === filter);

  return (
    <section id="ratings" ref={sectionRef} className="py-20 md:py-28 border-t border-hairline" aria-label="Skill ratings">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Proficiency</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-4">Skill Ratings</h2>
          <p className="text-sm text-stone max-w-lg mb-8">
            Self-assessed proficiency levels. Honest ratings — no inflation. Learning items shown separately at their current early stage.
          </p>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter skills by category">
            {categories.map((cat) => (
              <FilterPill key={cat} label={cat} isActive={filter === cat} onClick={() => setFilter(cat)} />
            ))}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <SummaryBar skills={filter === 'all' ? SKILLS : filteredSkills} isInView={isInView} reduced={reduced} />

          <AnimatePresence mode="wait">
            <motion.div
              key={filter + '-skills'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10"
            >
              {filteredSkills.map((skill, i) => (
                <RatingBadge key={skill.id} skill={skill} index={i} isInView={isInView} reduced={reduced} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredLearning.length > 0 && (
            <div className="mt-8 pt-8 border-t border-hairline">
              <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-4">Currently Learning</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={filter + '-learning'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  {filteredLearning.map((skill, i) => (
                    <RatingBadge key={skill.id} skill={skill} index={SKILLS.length + i} isInView={isInView} reduced={reduced} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {filteredSkills.length === 0 && filteredLearning.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <Icon icon="solar:filter-linear" width={24} className="text-taupe/40 mx-auto mb-3" />
              <p className="text-sm text-taupe">No skills match this filter.</p>
              <motion.button
                whileHover={{ borderColor: '#8a8580' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                className="mt-3 px-3 py-1.5 text-[11px] font-medium text-charcoal border border-hairline rounded-lg min-h-[36px] outline-none"
              >
                Show all
              </motion.button>
            </motion.div>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
