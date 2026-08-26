import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── GraphQL (exact, requires GITHUB_TOKEN) ───────────────────────────
const GRAPHQL_URL = 'https://api.github.com/graphql';

const QUERY = `
query($userName: String!) {
  user(login: $userName) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}
`;

async function fetchGraphQL(userName: string, token: string) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { userName } }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GraphQL ${response.status}: ${text.slice(0, 200)}`);
  }

  const json = await response.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('No contribution calendar in GraphQL response.');

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
    fetchedAt: Date.now(),
    source: 'graphql' as const,
  };
}

// ─── Scraping (no token needed) ───────────────────────────────────────
//
// GitHub's /users/{name}/contributions endpoint returns HTML with:
//
// 1. <td> cells: id="contribution-day-component-W-D" data-date="YYYY-MM-DD" data-level="0-4"
// 2. <tool-tip> elements: for="contribution-day-component-W-D">{count} contributions on {date}
// 3. Total: "674\ncontributions\n  in the last year"
//
// We match tooltips to cells by id/for, giving EXACT per-day counts.

interface DayEntry {
  date: string;
  count: number;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function parseContributionHTML(html: string): {
  days: DayEntry[];
  totalContributions: number;
} {
  // ── Step 1: Parse <td> cells → map cell-id to date ────────────────
  const cellDateMap = new Map<string, string>();

  // Pattern: id="contribution-day-component-..." ... data-date="YYYY-MM-DD"
  // The attributes can appear in any order, so we try both orderings.
  const tdPattern1 = /id="(contribution-day-component-[^"]+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g;
  const tdPattern2 = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[^"]+)"/g;

  let m: RegExpExecArray | null;
  while ((m = tdPattern1.exec(html)) !== null) {
    cellDateMap.set(m[1], m[2]);
  }
  if (cellDateMap.size === 0) {
    while ((m = tdPattern2.exec(html)) !== null) {
      cellDateMap.set(m[2], m[1]);
    }
  }

  // ── Step 2: Parse <tool-tip> elements → map cell-id to count ───────
  const cellCountMap = new Map<string, number>();

  // Pattern: for="contribution-day-component-..." ...>N contributions on
  const tipCountPattern = /for="(contribution-day-component-[^"]+)"[^>]*>(\d+)\s+contributions?\s+on/gi;
  while ((m = tipCountPattern.exec(html)) !== null) {
    cellCountMap.set(m[1], parseInt(m[2], 10));
  }

  // Also handle "No contributions on" → count = 0 (not strictly needed
  // since missing entries default to 0, but explicit is better)
  const tipNonePattern = /for="(contribution-day-component-[^"]+)"[^>]*>No\s+contributions?\s+on/gi;
  while ((m = tipNonePattern.exec(html)) !== null) {
    if (!cellCountMap.has(m[1])) {
      cellCountMap.set(m[1], 0);
    }
  }

  // ── Step 3: Merge — for each cell, look up count by id ─────────────
  const days: DayEntry[] = [];

  if (cellDateMap.size > 0 && cellCountMap.size > 0) {
    // We have both id→date and id→count mappings
    for (const [id, date] of cellDateMap) {
      const count = cellCountMap.get(id) ?? 0;
      days.push({ date, count });
    }
  } else {
    // Fallback: parse tooltips directly for count + date text
    // This loses the year, but we can infer it
    const monthMap: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    // "N contributions on Month Dayth"
    const directPattern = />(\d+)\s+contributions?\s+on\s+(\w+)\s+(\d+)\w*[,.]?/gi;
    while ((m = directPattern.exec(html)) !== null) {
      const count = parseInt(m[1], 10);
      const monthStr = m[2].toLowerCase();
      const dayNum = parseInt(m[3], 10);
      const monthIdx = monthMap[monthStr];
      if (monthIdx !== undefined) {
        // Infer year: if month is in the future relative to today, use last year
        const now = new Date();
        let year = now.getFullYear();
        if (monthIdx > now.getMonth() || (monthIdx === now.getMonth() && dayNum > now.getDate())) {
          year--;
        }
        const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        days.push({ date: dateStr, count });
      }
    }
  }

  // ── Step 4: Parse total contributions text ─────────────────────────
  let totalContributions = 0;

  // GitHub renders the total as:
  //   <h2 ...>674\ncontributions\n  in the last year</h2>
  // The number is on its own line. Look for a number followed (within
  // a few hundred chars) by "contributions" and "in the last year".
  const totalPattern = /(\d[\d,]*)\s*\n\s*contributions?\s*\n\s*in\s+the\s+last\s+year/i;
  const totalMatch = html.match(totalPattern);
  if (totalMatch) {
    totalContributions = parseInt(totalMatch[1].replace(/,/g, ''), 10);
  }

  // Also try single-line format: "674 contributions in the last year"
  if (totalContributions === 0) {
    const altPattern = /(\d[\d,]*)\s+contributions?\s+in\s+the\s+last\s+year/i;
    const altMatch = html.match(altPattern);
    if (altMatch) {
      totalContributions = parseInt(altMatch[1].replace(/,/g, ''), 10);
    }
  }

  // If we still don't have a total but have per-day data, sum them
  if (totalContributions === 0 && days.length > 0) {
    totalContributions = days.reduce((s, d) => s + d.count, 0);
  }

  return { days, totalContributions };
}

function buildWeeks(days: DayEntry[]) {
  // Sort by date
  days.sort((a, b) => a.date.localeCompare(b.date));

  const weeks: { contributionDays: { date: string; contributionCount: number }[] }[] = [];
  let currentWeek: { date: string; contributionCount: number }[] = [];

  for (const day of days) {
    const dow = new Date(day.date + 'T12:00:00').getDay();

    // Sunday starts a new week (if we have prior days)
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }

    currentWeek.push({ date: day.date, contributionCount: day.count });

    // Saturday ends the week
    if (dow === 6) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
  }

  // Push remaining days
  if (currentWeek.length > 0) {
    weeks.push({ contributionDays: currentWeek });
  }

  return weeks;
}

async function scrapeContributions(userName: string) {
  // Try the contributions-only endpoint first (lighter HTML)
  const endpoints = [
    `https://github.com/users/${userName}/contributions`,
    `https://github.com/${userName}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
      });

      if (!response.ok) continue;

      const html = await response.text();
      const { days, totalContributions } = parseContributionHTML(html);

      if (days.length === 0 && totalContributions === 0) continue;

      const weeks = buildWeeks(days);
      const daySum = days.reduce((s, d) => s + d.count, 0);

      return {
        totalContributions: totalContributions || daySum,
        weeks,
        fetchedAt: Date.now(),
        source: 'scraped' as const,
        _meta: {
          daysParsed: days.length,
          weeksParsed: weeks.length,
          daySum,
          totalFromText: totalContributions,
          endpoint: url,
        },
      };
    } catch {
      continue;
    }
  }

  throw new Error('All scraping endpoints failed.');
}

// ─── Handler ──────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userName = (req.query.userName as string) || 'Byte-Craftsman-Alpha';

  // 1. GraphQL (exact, requires GITHUB_TOKEN)
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const data = await fetchGraphQL(userName, token);
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate(3600)');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(data);
      return;
    } catch (err) {
      console.error('[contributions] GraphQL failed:', err);
    }
  }

  // 2. Scrape (exact per-day counts from tooltips, no token needed)
  try {
    const data = await scrapeContributions(userName);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate(1800)');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
    return;
  } catch (err) {
    console.error('[contributions] Scraping failed:', err);
  }

  res.status(502).json({
    error: 'Unable to fetch contribution data.',
    hint: token
      ? 'Both GraphQL and scraping failed.'
      : 'Set GITHUB_TOKEN env var in Vercel for GraphQL-based exact counts.',
  });
}
