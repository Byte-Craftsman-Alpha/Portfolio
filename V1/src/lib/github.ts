// ─── GitHub API Service ───────────────────────────────────────────────
// Primary: Static JSON fetched at build time (exact 674 count)
// Secondary: Serverless API (if deployed with GITHUB_TOKEN)
// Tertiary: CORS proxy (client-side scraping, unreliable)
// Quaternary: REST API fallback (approximate)

import { personal } from '../data/portfolio';

// ─── Types ────────────────────────────────────────────────────────────

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface GitHubStats {
  totalContributions: number;
  contributions: ContributionDay[];
  longestStreak: number;
  currentStreak: number;
  source: 'build-time' | 'graphql' | 'scraped' | 'rest-fallback';
  fetchedAt: number;
}

export interface RepoInfo {
  name: string;
  fork: boolean;
  pushedAt: string;
  language: string | null;
}

// ─── Streaks ──────────────────────────────────────────────────────────

function calcStreaks(contributions: ContributionDay[]) {
  let longestStreak = 0;
  let cur = 0;
  for (const d of contributions) {
    if (d.count > 0) { cur++; longestStreak = Math.max(longestStreak, cur); }
    else { cur = 0; }
  }
  let currentStreak = 0;
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) { currentStreak++; }
    else { if (i === contributions.length - 1) continue; break; }
  }
  return { longestStreak, currentStreak };
}

// ─── Shared: flatten API weeks → contributions array ─────────────────

function flattenWeeks(weeks: any[]): ContributionDay[] {
  const contributions: ContributionDay[] = [];
  for (const week of weeks) {
    if (!Array.isArray(week.contributionDays)) continue;
    for (const day of week.contributionDays) {
      contributions.push({ date: day.date, count: day.contributionCount || 0 });
    }
  }
  contributions.sort((a, b) => a.date.localeCompare(b.date));
  return contributions;
}

// ─── Primary: Build-time static JSON ──────────────────────────────────

async function fetchBuildTime(): Promise<GitHubStats | null> {
  try {
    const res = await fetch('/contributions.json');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.weeks || !Array.isArray(data.weeks)) return null;

    const contributions = flattenWeeks(data.weeks);
    const { longestStreak, currentStreak } = calcStreaks(contributions);

    return {
      totalContributions: data.totalContributions || 0,
      contributions,
      longestStreak,
      currentStreak,
      source: 'build-time',
      fetchedAt: data.fetchedAt || Date.now(),
    };
  } catch {
    return null;
  }
}

// ─── Secondary: Serverless API ────────────────────────────────────────

async function fetchFromAPI(username: string): Promise<GitHubStats | null> {
  try {
    const res = await fetch(`/api/contributions?userName=${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.weeks || !Array.isArray(data.weeks)) return null;

    const contributions = flattenWeeks(data.weeks);
    const { longestStreak, currentStreak } = calcStreaks(contributions);

    return {
      totalContributions: data.totalContributions || 0,
      contributions,
      longestStreak,
      currentStreak,
      source: data.source === 'graphql' ? 'graphql' : 'scraped',
      fetchedAt: data.fetchedAt || Date.now(),
    };
  } catch {
    return null;
  }
}

// ─── REST fallback ────────────────────────────────────────────────────

const REST = 'https://api.github.com';

async function restFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchRESTFallback(
  username: string,
  onProgress?: (msg: string) => void,
): Promise<GitHubStats> {
  const countMap = new Map<string, number>();
  const add = (ds: string, n: number) => countMap.set(ds, (countMap.get(ds) || 0) + n);

  onProgress?.('Fetching repositories…');
  const reposData = await restFetch<any[]>(`${REST}/users/${username}/repos?per_page=100&sort=pushed`);
  if (Array.isArray(reposData)) {
    const ownRepos = reposData.filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
    const since = new Date(); since.setDate(since.getDate() - 365);
    for (const repo of ownRepos.slice(0, 8)) {
      onProgress?.(`Scanning ${repo.name}…`);
      const commits = await restFetch<any[]>(
        `${REST}/repos/${username}/${repo.name}/commits?since=${since.toISOString()}&per_page=100`,
      );
      if (Array.isArray(commits)) {
        for (const c of commits) {
          const ds = (c.commit?.author?.date || c.commit?.committer?.date)?.split('T')[0];
          if (ds) add(ds, 1);
        }
      }
    }
  }

  const events = await restFetch<any[]>(`${REST}/users/${username}/events/public?per_page=100`);
  if (Array.isArray(events)) {
    for (const ev of events) {
      const ds = (ev.created_at as string)?.split('T')[0];
      if (!ds) continue;
      if (ev.type === 'PushEvent') add(ds, ev.payload?.commits?.length || 1);
      else if (['PullRequestEvent', 'IssuesEvent', 'ReleaseEvent'].includes(ev.type)) add(ds, 1);
    }
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today); start.setDate(start.getDate() - 364); start.setDate(start.getDate() - start.getDay());
  const contributions: ContributionDay[] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const ds = cur.toISOString().split('T')[0];
    contributions.push({ date: ds, count: countMap.get(ds) || 0 });
    cur.setDate(cur.getDate() + 1);
  }

  const { longestStreak, currentStreak } = calcStreaks(contributions);
  return {
    totalContributions: contributions.reduce((s, d) => s + d.count, 0),
    contributions, longestStreak, currentStreak,
    source: 'rest-fallback', fetchedAt: Date.now(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────

export async function fetchContributions(
  username: string = personal.githubUsername,
  onProgress?: (msg: string) => void,
): Promise<GitHubStats> {
  // 1. Build-time static JSON (exact counts, always available)
  const buildTime = await fetchBuildTime();
  if (buildTime) return buildTime;

  // 2. Serverless API (if deployed)
  const api = await fetchFromAPI(username);
  if (api) return api;

  // 3. REST fallback (approximate)
  onProgress?.('Using REST API fallback…');
  return fetchRESTFallback(username, onProgress);
}

export async function fetchRepos(username: string): Promise<RepoInfo[]> {
  const data = await restFetch<any[]>(`${REST}/users/${username}/repos?per_page=100&sort=pushed`);
  if (!Array.isArray(data)) return [];
  return data.map((r) => ({
    name: r.name, fork: r.fork, pushedAt: r.pushed_at || '', language: r.language || null,
  }));
}
