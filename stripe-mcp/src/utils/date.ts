/**
 * Date utilities for consistent Stripe timestamp handling.
 * Stripe returns Unix timestamps (seconds); we surface both Unix and ISO 8601.
 */

const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** Convert a Unix timestamp (seconds) to an ISO 8601 string. */
export function fromUnixTimestamp(ts: number): string {
  return new Date(ts * 1000).toISOString();
}

/** Convert an ISO 8601 string to a Unix timestamp (seconds). */
export function toUnixTimestamp(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

/** Human-readable relative time from a Unix timestamp (seconds). */
export function formatRelative(ts: number): string {
  const diffMs = ts * 1000 - Date.now();
  const abs = Math.abs(diffMs);
  for (const { unit, ms } of RELATIVE_UNITS) {
    if (abs >= ms || unit === 'second') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return 'just now';
}

/** Current Unix timestamp in seconds. */
export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

/** Unix timestamp N days ago (seconds). */
export function daysAgoUnix(days: number): number {
  return nowUnix() - days * 24 * 60 * 60;
}

/** Resolve a human period string to a [start, end] unix range (seconds). */
export function resolvePeriod(
  period:
    | 'last_7_days'
    | 'last_30_days'
    | 'last_90_days'
    | 'last_12_months'
    | 'month_to_date'
    | 'year_to_date',
): { start: number; end: number } {
  const end = nowUnix();
  const day = 24 * 60 * 60;
  switch (period) {
    case 'last_7_days':
      return { start: end - 7 * day, end };
    case 'last_30_days':
      return { start: end - 30 * day, end };
    case 'last_90_days':
      return { start: end - 90 * day, end };
    case 'last_12_months':
      return { start: end - 365 * day, end };
    case 'month_to_date': {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: Math.floor(start.getTime() / 1000), end };
    }
    case 'year_to_date': {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: Math.floor(start.getTime() / 1000), end };
    }
  }
}
