import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Icon } from '@iconify/react';
import { metrics } from '../data/portfolio';
import { fetchRepos } from '../lib/github';
import { personal } from '../data/portfolio';

interface LiveData { repoCount: number | null; languageCount: number | null; }

// ─── Interactive metric card ──────────────────────────────────────────

function MetricCard({ value, label, source, delay, isInView }: {
  value: string; label: string; source: string; delay: number; isInView: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? {
        opacity: 1, y: 0,
        scale: isPressed ? 0.97 : 1,
        boxShadow: isFocused
          ? '0 0 0 2px #faf9f6, 0 0 0 4px rgba(44,44,44,0.25)'
          : isHovered ? '0 4px 12px rgba(44,44,44,0.08)' : '0 0 0 0px transparent',
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
      role="listitem"
      aria-label={`${value} ${label}`}
      style={{ y: isPressed ? 2 : 0 }}
      className="text-center py-3 px-2 rounded-xl outline-none cursor-default"
    >
      <motion.p
        className="text-3xl md:text-4xl font-semibold text-charcoal mb-1"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-taupe uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[10px] text-taupe/60 flex items-center justify-center gap-1">
        <Icon icon={source === 'github' ? 'solar:verified-check-linear' : 'solar:pen-new-square-linear'} width={12} />
        {source === 'github' ? 'GitHub-verified' : 'Self-reported'}
      </p>
    </motion.div>
  );
}

export default function ProofMetrics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [live, setLive] = useState<LiveData>({ repoCount: null, languageCount: null });
  const fetched = useRef(false);

  useEffect(() => {
    if (!isInView || fetched.current) return;
    fetched.current = true;
    fetchRepos(personal.githubUsername).then((repos) => {
      const ownRepos = repos.filter((r) => !r.fork);
      const langs = new Set(repos.map((r) => r.language).filter(Boolean));
      setLive({ repoCount: ownRepos.length, languageCount: langs.size });
    }).catch(() => {});
  }, [isInView]);

  const displayMetrics = metrics.map((m) => {
    if (m.label === 'Repositories' && live.repoCount !== null) return { ...m, value: String(live.repoCount), source: 'github' as const };
    if (m.label === 'Languages' && live.languageCount !== null) return { ...m, value: String(live.languageCount), source: 'github' as const };
    return m;
  });

  return (
    <section ref={ref} className="py-16 border-y border-hairline" aria-label="Key metrics">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {displayMetrics.map((metric, i) => (
            <MetricCard key={metric.label} value={metric.value} label={metric.label} source={metric.source} delay={i * 0.1} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
