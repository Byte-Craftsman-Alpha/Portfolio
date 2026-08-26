// Build-time script: fetch contribution data from GitHub and save as static JSON.
// Runs server-side — no CORS issues.
// Usage: node scripts/fetch-contributions.ts (compiled) or tsx scripts/fetch-contributions.ts

const USERNAME = 'Byte-Craftsman-Alpha';
const OUTPUT = 'public/contributions.json';
const fs = require('fs');
const https = require('https');

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseContributionHTML(html) {
  // Step 1: Parse <td> cells → map cell-id to date
  // Actual attribute order: data-date BEFORE id
  const cellDateMap = new Map();
  const p1 = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[^"]+)"/g;
  const p2 = /id="(contribution-day-component-[^"]+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g;

  let m;
  while ((m = p1.exec(html)) !== null) cellDateMap.set(m[2], m[1]);
  if (cellDateMap.size === 0) {
    while ((m = p2.exec(html)) !== null) cellDateMap.set(m[1], m[2]);
  }

  // Step 2: Parse <tool-tip> → map cell-id to count
  const cellCountMap = new Map();
  const tipCount = /for="(contribution-day-component-[^"]+)"[^>]*>(\d+)\s+contributions?\s+on/gi;
  while ((m = tipCount.exec(html)) !== null) {
    cellCountMap.set(m[1], parseInt(m[2], 10));
  }
  const tipNone = /for="(contribution-day-component-[^"]+)"[^>]*>No\s+contributions?\s+on/gi;
  while ((m = tipNone.exec(html)) !== null) {
    if (!cellCountMap.has(m[1])) cellCountMap.set(m[1], 0);
  }

  // Step 3: Merge
  const days = [];
  for (const [id, date] of cellDateMap) {
    days.push({ date, count: cellCountMap.get(id) || 0 });
  }

  // Step 4: Parse total
  let totalContributions = 0;
  const totalP = /(\d[\d,]*)\s*\n\s*contributions?\s*\n\s*in\s+the\s+last\s+year/i;
  const totalM = html.match(totalP);
  if (totalM) totalContributions = parseInt(totalM[1].replace(/,/g, ''), 10);
  if (totalContributions === 0) {
    const altP = /(\d[\d,]*)\s+contributions?\s+in\s+the\s+last\s+year/i;
    const altM = html.match(altP);
    if (altM) totalContributions = parseInt(altM[1].replace(/,/g, ''), 10);
  }
  if (totalContributions === 0) {
    totalContributions = days.reduce((s, d) => s + d.count, 0);
  }

  return { days, totalContributions };
}

function buildWeeks(days) {
  days.sort((a, b) => a.date.localeCompare(b.date));
  const weeks = [];
  let currentWeek = [];

  for (const day of days) {
    const dow = new Date(day.date + 'T12:00:00').getDay();
    if (dow === 0 && currentWeek.length > 0) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
    currentWeek.push({ date: day.date, contributionCount: day.count });
    if (dow === 6) {
      weeks.push({ contributionDays: currentWeek });
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push({ contributionDays: currentWeek });
  return weeks;
}

async function main() {
  console.log(`Fetching contribution data for ${USERNAME}...`);

  const endpoints = [
    `https://github.com/users/${USERNAME}/contributions`,
    `https://github.com/${USERNAME}`,
  ];

  for (const url of endpoints) {
    try {
      console.log(`  Trying: ${url}`);
      const html = await fetchHTML(url);
      console.log(`  HTML length: ${html.length}`);

      const { days, totalContributions } = parseContributionHTML(html);
      const daySum = days.reduce((s, d) => s + d.count, 0);
      console.log(`  Days parsed: ${days.length}, Day sum: ${daySum}, Total from text: ${totalContributions}`);

      if (days.length === 0 && totalContributions === 0) continue;

      const weeks = buildWeeks(days);

      const output = {
        totalContributions: totalContributions || daySum,
        weeks,
        fetchedAt: Date.now(),
        source: 'scraped',
      };

      fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 0));
      console.log(`  Saved to ${OUTPUT}`);
      console.log(`  Total contributions: ${output.totalContributions}`);
      console.log(`  Weeks: ${weeks.length}`);
      return;
    } catch (err) {
      console.error(`  Failed:`, err.message);
    }
  }

  // Write empty fallback
  fs.writeFileSync(OUTPUT, JSON.stringify({ totalContributions: 0, weeks: [], fetchedAt: Date.now(), source: 'none' }));
  console.log('  All endpoints failed. Wrote empty fallback.');
}

main().catch(console.error);
