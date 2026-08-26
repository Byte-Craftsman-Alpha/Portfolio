// ─── URL Reporter ────────────────────────────────────────────────────
// Sends the deployed site URL to a configurable endpoint once per session.
// This lets you discover the live URL after deployment.
//
// Configuration:
//   Set REPORT_URL_ENDPOINT in .env or replace the default below.
//   Set REPORT_URL_ENABLED=false to disable.
//
// The function is non-blocking, silent on failure, and only fires once
// per browser session (uses sessionStorage flag).

const SESSION_KEY = '__url_reported';

// ─── Endpoint configuration ────────────────────────────────────────────
// Replace this with your actual endpoint, or set the env var.
// The endpoint receives a POST with: { url, timestamp, source }
const ENDPOINT =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_REPORT_URL_ENDPOINT ||
      'https://url-report-hook.workers.dev/report'
    : 'https://url-report-hook.workers.dev/report';

const ENABLED =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_REPORT_URL_ENABLED !== 'false'
    : true;

export async function reportUrl(): Promise<void> {
  // Skip if disabled
  if (!ENABLED) return;

  // Skip if not in browser
  if (typeof window === 'undefined') return;

  // Skip if already reported this session
  if (sessionStorage.getItem(SESSION_KEY)) return;

  // Mark as reported immediately to prevent duplicates
  sessionStorage.setItem(SESSION_KEY, '1');

  const payload = {
    url: window.location.origin + window.location.pathname,
    href: window.location.href,
    timestamp: new Date().toISOString(),
    source: 'aditya-portfolio',
  };

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // ensures the request completes even if page unloads
    });
  } catch {
    // Silent — remove the session flag so it retries next session
    sessionStorage.removeItem(SESSION_KEY);
  }
}
