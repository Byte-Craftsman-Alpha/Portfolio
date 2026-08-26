import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Icon } from '@iconify/react';
import { personal } from '../data/portfolio';
import { fetchContributions, type GitHubStats, type ContributionDay } from '../lib/github';
import SectionReveal from './SectionReveal';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Grid helpers ─────────────────────────────────────────────────────
const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;

interface GridDay extends ContributionDay {
  week: number;
  day: number; // 0=Sun .. 6=Sat
}

function toGrid(contributions: ContributionDay[]): GridDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const countMap = new Map(contributions.map((c) => [c.date, c.count]));
  const days: GridDay[] = [];
  const cur = new Date(start);
  let wi = 0;

  while (cur <= today) {
    const ds = cur.toISOString().split('T')[0];
    days.push({ date: ds, count: countMap.get(ds) || 0, week: wi, day: cur.getDay() });
    if (cur.getDay() === 6) wi++;
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function formatCount(n: number): string {
  if (n === 0) return 'No contributions';
  if (n === 1) return '1 contribution';
  return `${n} contributions`;
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function intensityFill(count: number, max: number): string {
  if (count === 0) return '#e8e4df';
  const r = count / Math.max(max, 1);
  if (r <= 0.2) return '#c9c3bc';
  if (r <= 0.4) return '#a09a93';
  if (r <= 0.65) return '#7a746d';
  if (r <= 0.85) return '#555049';
  return '#2c2c2c';
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────
export default function ContributionGrid() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState('');
  const [hovered, setHovered] = useState<GridDay | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const fetched = useRef(false);

  const loadData = useCallback(async () => {
    fetched.current = true;
    try {
      setLoading(true);
      setError(false);
      setProgress('Fetching contribution calendar from GitHub…');

      const result = await fetchContributions(
        personal.githubUsername,
        (msg) => setProgress(msg),
      );

      setStats(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, []);

  const refresh = useCallback(() => {
    fetched.current = false;
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isInView && !fetched.current) loadData();
  }, [isInView, loadData]);

  const gridDays = stats ? toGrid(stats.contributions) : [];
  const maxCount = Math.max(...gridDays.map((d) => d.count), 1);

  const weeks: GridDay[][] = [];
  for (const d of gridDays) {
    if (!weeks[d.week]) weeks[d.week] = [];
    weeks[d.week].push(d);
  }

  const monthLabels: { label: string; week: number }[] = [];
  let lastM = '';
  for (const w of weeks) {
    if (!w?.length) continue;
    const m = new Date(w[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
    if (m !== lastM) {
      monthLabels.push({ label: m, week: w[0].week });
      lastM = m;
    }
  }

  const svgW = weeks.length * STEP + 2;
  const svgH = 7 * STEP + 2;
  const sourceLabel =
    stats?.source === 'build-time'
      ? 'Exact counts — fetched at build time from GitHub'
      : stats?.source === 'graphql'
        ? 'Exact counts from GitHub GraphQL API'
        : stats?.source === 'scraped'
          ? 'Counts from GitHub profile (scraped)'
          : 'Approximate counts from GitHub REST API (fallback)';

  return (
    <section
      id="contributions"
      ref={sectionRef}
      className="py-20 md:py-28 border-t border-hairline"
      aria-label="GitHub contributions"
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
            <div>
              <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Activity</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">
                Commit History
              </h2>
            </div>
            {stats && !loading && (
              <motion.button
                onClick={refresh}
                whileHover={{ borderColor: '#8a8580', color: '#2c2c2c' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-stone border border-hairline rounded-lg min-h-[36px] outline-none"
                aria-label="Refresh contribution data"
              >
                <motion.span whileTap={{ rotate: -180 }} transition={{ duration: 0.3 }}>
                  <Icon icon="solar:refresh-linear" width={13} />
                </motion.span>
                Refresh
              </motion.button>
            )}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          {loading ? (
            <div className="py-12" aria-live="polite" aria-label="Loading contributions">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-hairline border-t-charcoal rounded-full"
                />
                <p className="text-sm text-taupe">
                  {progress || 'Fetching contribution data…'}
                </p>
              </div>
              <p className="text-[10px] text-taupe/50">
                Querying GitHub GraphQL API for exact contribution counts.
              </p>
            </div>
          ) : error ? (
            <div className="py-8 px-6 border border-hairline rounded-xl bg-ivory text-center" role="alert">
              <Icon icon="solar:shield-warning-linear" width={24} className="text-taupe mx-auto mb-2" />
              <p className="text-sm text-stone mb-4">
                Unable to load contribution data. The serverless API or GitHub may be temporarily unavailable.
              </p>
              <motion.button
                onClick={refresh}
                whileHover={{ borderColor: '#8a8580' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="px-4 py-2 text-xs font-medium text-charcoal border border-hairline rounded-lg min-h-[36px] outline-none"
              >
                Retry
              </motion.button>
            </div>
          ) : !stats || gridDays.length === 0 ? (
            <div className="py-8 px-6 border border-hairline rounded-xl bg-ivory text-center">
              <p className="text-sm text-taupe">No contribution data available.</p>
            </div>
          ) : (
            <div>
              {/* Stats row */}
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 mb-2">
                <div>
                  <span className="text-2xl font-semibold text-charcoal">
                    {stats.totalContributions}
                  </span>
                  <span className="text-sm text-stone ml-2">
                    contributions in the last year
                  </span>
                </div>
                {stats.longestStreak > 0 && (
                  <div>
                    <span className="text-2xl font-semibold text-charcoal">
                      {stats.longestStreak}
                    </span>
                    <span className="text-sm text-stone ml-2">day longest streak</span>
                  </div>
                )}
                {stats.currentStreak > 0 && (
                  <div>
                    <span className="text-2xl font-semibold text-charcoal">
                      {stats.currentStreak}
                    </span>
                    <span className="text-sm text-stone ml-2">day current streak</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-taupe/50 mb-8">
                {sourceLabel}
                {' · Fetched '}
                {timeAgo(stats.fetchedAt)}
              </p>

              {/* Contribution grid SVG */}
              <div className="overflow-x-auto scrollbar-hide -ml-8 pl-8 pr-2">
                <svg
                  width={svgW + 34}
                  height={svgH + 21}
                  viewBox={`0 0 ${svgW + 34} ${svgH + 21}`}
                  className="block"
                  role="img"
                  aria-label={`${stats.totalContributions} contributions in the last year`}
                >
                  {/* Day-of-week labels */}
                  {[{ l: 'Mon', y: 1 }, { l: 'Wed', y: 3 }, { l: 'Fri', y: 5 }].map(({ l, y }) => (
                    <text
                      key={l}
                      x={2}
                      y={y * STEP + CELL / 2 + 19}
                      fill="#8a8580"
                      fontSize={10}
                      fontFamily="Public Sans, system-ui, sans-serif"
                    >
                      {l}
                    </text>
                  ))}

                  {/* Month labels */}
                  {monthLabels.map(({ label, week }, i) => (
                    <text
                      key={`${label}-${i}`}
                      x={week * STEP + 34}
                      y={11}
                      fill="#8a8580"
                      fontSize={10}
                      fontFamily="Public Sans, system-ui, sans-serif"
                    >
                      {label}
                    </text>
                  ))}

                  {/* Contribution cells */}
                  {weeks.map((week) =>
                    week.map((day) => (
                      <rect
                        key={day.date}
                        x={day.week * STEP + 34}
                        y={day.day * STEP + 19}
                        width={CELL}
                        height={CELL}
                        rx={2}
                        ry={2}
                        fill={intensityFill(day.count, maxCount)}
                        style={{ cursor: day.count > 0 ? 'pointer' : 'default' }}
                        onMouseEnter={() => !reduced && setHovered(day)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <title>
                          {formatCount(day.count)} on {formatDateLabel(day.date)}
                        </title>
                      </rect>
                    )),
                  )}
                </svg>
              </div>

              {/* Hover detail — always in DOM, visibility toggled to prevent layout flicker */}
              <div
                className="mt-3 px-3 py-2 bg-charcoal text-ivory text-[11px] rounded-md inline-block"
                style={{
                  visibility: hovered && !reduced ? 'visible' : 'hidden',
                  opacity: hovered && !reduced ? 1 : 0,
                  transition: 'opacity 0.12s ease',
                }}
                aria-hidden={!hovered}
              >
                <span className="font-medium">{formatCount(hovered?.count ?? 0)}</span>
                {' on '}
                {formatDateLabel(hovered?.date ?? '')}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-1.5 mt-4">
                <span className="text-[10px] text-taupe mr-1">Less</span>
                {['#e8e4df', '#c9c3bc', '#a09a93', '#7a746d', '#2c2c2c'].map((fill, i) => (
                  <svg key={i} width={CELL} height={CELL} className="block">
                    <rect width={CELL} height={CELL} rx={2} ry={2} fill={fill} />
                  </svg>
                ))}
                <span className="text-[10px] text-taupe ml-1">More</span>
              </div>

              <p className="text-[10px] text-taupe/50 mt-4">
                {stats.source === 'build-time'
                  ? 'Contribution data fetched from GitHub at build time. Reflects the latest data each time the site is rebuilt.'
                  : stats.source === 'graphql'
                    ? 'Data from GitHub GraphQL contributionsCollection — exact counts matching your GitHub profile.'
                    : stats.source === 'scraped'
                      ? 'Total count from GitHub profile page. For exact per-cell counts, set GITHUB_TOKEN env var in Vercel.'
                      : 'Approximate data from GitHub REST API. For exact counts, set GITHUB_TOKEN env var in Vercel.'}
              </p>
            </div>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
