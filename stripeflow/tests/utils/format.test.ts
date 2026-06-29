import { describe, it, expect } from 'vitest';
import { formatAmount, toMajorUnit, normalizeToMonthly, isZeroDecimal } from '../../src/utils/currency.js';
import { fromUnixTimestamp, toUnixTimestamp, resolvePeriod } from '../../src/utils/date.js';
import { formatStripeError } from '../../src/utils/format-stripe-error.js';

describe('currency utils', () => {
  it('formats two-decimal currencies', () => {
    expect(formatAmount(1250, 'usd')).toBe('$12.50');
    expect(formatAmount(1000, 'eur')).toBe('€10.00');
    expect(formatAmount(0, 'gbp')).toBe('£0.00');
  });

  it('formats zero-decimal currencies without decimals', () => {
    expect(formatAmount(1000, 'jpy')).toBe('¥1000');
    expect(formatAmount(5000, 'krw')).toBe('₩5000');
  });

  it('formats three-decimal currencies', () => {
    expect(formatAmount(1250, 'bhd')).toBe('BHD 1.250');
  });

  it('converts to major units', () => {
    expect(toMajorUnit(1250, 'usd')).toBe(12.5);
    expect(toMajorUnit(1000, 'jpy')).toBe(1000);
    expect(toMajorUnit(1250, 'bhd')).toBe(1.25);
  });

  it('normalizes recurring amounts to monthly', () => {
    expect(normalizeToMonthly(2000, 'usd', 'month')).toBe(20);
    // $120/yr ÷ 12 = $10/mo
    expect(normalizeToMonthly(12000, 'usd', 'year')).toBeCloseTo(10, 5);
    // $20/week * 52 / 12 ≈ $86.67/mo
    expect(normalizeToMonthly(2000, 'usd', 'week')).toBeCloseTo(86.6667, 3);
    // $10/day * 365 / 12 ≈ $304.17/mo
    expect(normalizeToMonthly(1000, 'usd', 'day')).toBeCloseTo(304.1667, 3);
    expect(normalizeToMonthly(1000, 'usd', null)).toBe(0);
  });

  it('detects zero-decimal currencies', () => {
    expect(isZeroDecimal('jpy')).toBe(true);
    expect(isZeroDecimal('USD')).toBe(false);
  });
});

describe('date utils', () => {
  it('converts unix → ISO', () => {
    expect(fromUnixTimestamp(0)).toBe('1970-01-01T00:00:00.000Z');
    expect(fromUnixTimestamp(1_700_000_000)).toBe('2023-11-14T22:13:20.000Z');
  });

  it('converts ISO → unix', () => {
    expect(toUnixTimestamp('1970-01-01T00:00:00.000Z')).toBe(0);
    expect(toUnixTimestamp('2023-11-14T22:13:20.000Z')).toBe(1_700_000_000);
  });

  it('resolvePeriod returns a sane start < end range', () => {
    for (const period of [
      'last_7_days',
      'last_30_days',
      'last_90_days',
      'last_12_months',
      'month_to_date',
      'year_to_date',
    ] as const) {
      const { start, end } = resolvePeriod(period);
      expect(start).toBeLessThan(end);
      expect(end).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 1);
    }
  });
});

describe('formatStripeError', () => {
  it('formats an authentication error with a fix', () => {
    const msg = formatStripeError({ type: 'StripeAuthenticationError', message: 'bad key' });
    expect(msg).toContain('Authentication failed');
    expect(msg).toContain('dashboard.stripe.com/apikeys');
  });

  it('formats a card error with decline-code link', () => {
    const msg = formatStripeError({ type: 'StripeCardError', message: 'Your card was declined.' });
    expect(msg).toContain('Card error');
    expect(msg).toContain('declines/codes');
  });

  it('formats an invalid-request error with the param', () => {
    const msg = formatStripeError({
      type: 'StripeInvalidRequestError',
      message: 'Missing required param',
      param: 'customer',
    });
    expect(msg).toContain('Invalid request');
    expect(msg).toContain('customer');
  });

  it('falls back for unknown error shapes', () => {
    const msg = formatStripeError('totally unknown');
    expect(msg).toContain('Unknown error');
  });
});
