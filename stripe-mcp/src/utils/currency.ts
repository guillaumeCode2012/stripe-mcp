/**
 * Currency formatting utilities.
 *
 * Stripe stores amounts in the smallest currency unit (cents for USD/EUR,
 * whole units for zero-decimal currencies like JPY/KRW). These helpers
 * convert to human-readable strings and major units safely.
 */

// Zero-decimal currencies (ISO 4217) — no fractional units.
// Source: https://stripe.com/docs/currencies#zero-decimal
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
  'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

// Three-decimal currencies (e.g. Bahraini Dinar).
const THREE_DECIMAL_CURRENCIES = new Set(['bhd', 'jod', 'kwd', 'omr', 'tnd']);

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$', eur: '€', gbp: '£', jpy: '¥', cny: '¥', inr: '₹',
  krw: '₩', rub: '₽', brl: 'R$', cad: 'C$', aud: 'A$', chf: 'CHF',
  sek: 'kr', nok: 'kr', dkk: 'kr', pln: 'zł', try: '₺', mxn: 'MX$',
  sgd: 'S$', hkd: 'HK$', nzd: 'NZ$', zar: 'R', aed: 'AED', sar: 'SAR',
};

/**
 * Convert a Stripe amount (smallest unit) to a human-readable string.
 * @example formatAmount(1250, 'usd') → '$12.50'
 * @example formatAmount(1000, 'jpy') → '¥1000'
 * @example formatAmount(1250, 'bhd') → 'BHD 1.250'
 */
export function formatAmount(amount: number, currency: string): string {
  const c = currency.toLowerCase();
  const rawSymbol = CURRENCY_SYMBOLS[c] ?? c.toUpperCase();
  // For 3-letter currency codes (no dedicated symbol), add a space for
  // readability: "BHD 1.250" reads better than "BHD1.250".
  const symbol =
    rawSymbol.length === 3 && rawSymbol === c.toUpperCase() ? `${rawSymbol} ` : rawSymbol;

  if (ZERO_DECIMAL_CURRENCIES.has(c)) {
    return `${symbol}${amount}`;
  }
  if (THREE_DECIMAL_CURRENCIES.has(c)) {
    const major = (amount / 1000).toFixed(3);
    return `${symbol}${major}`;
  }
  const major = (amount / 100).toFixed(2);
  return `${symbol}${major}`;
}

/**
 * Convert a Stripe amount (smallest unit) to its major-unit number.
 * @example toMajorUnit(1250, 'usd') → 12.5
 * @example toMajorUnit(1000, 'jpy') → 1000
 */
export function toMajorUnit(amount: number, currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return amount;
  if (THREE_DECIMAL_CURRENCIES.has(c)) return amount / 1000;
  return amount / 100;
}

/**
 * Normalize a recurring price to a monthly amount (in major units) for MRR.
 * - monthly → amount
 * - yearly  → amount / 12
 * - weekly  → amount * 52 / 12
 * - daily   → amount * 365 / 12
 * Returns 0 for one-time prices.
 */
export function normalizeToMonthly(
  amount: number,
  currency: string,
  interval: 'month' | 'year' | 'week' | 'day' | string | null | undefined,
): number {
  const major = toMajorUnit(amount, currency);
  switch (interval) {
    case 'month':
      return major;
    case 'year':
      return major / 12;
    case 'week':
      return (major * 52) / 12;
    case 'day':
      return (major * 365) / 12;
    default:
      return 0;
  }
}

export function isZeroDecimal(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
}
