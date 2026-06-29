import type Stripe from 'stripe';
import { getStripeClient, config, resetStripeClient } from './config.js';
import { allTools, TOOL_COUNT } from './tools/index.js';
import { formatStripeError } from './utils/format-stripe-error.js';

/**
 * Result of a single doctor check. `ok` drives the ✓/✗ marker; `detail` is
 * the human-readable line printed under the check name.
 */
interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

/** Write a line to stderr (the doctor is a human-readable command). */
function line(text: string): void {
  process.stderr.write(`${text}\n`);
}

/**
 * Run a full health check of the StripeFlow install and the configured Stripe
 * account. Prints a friendly report to stderr and returns a boolean
 * "all checks passed" so the caller can set the exit code.
 *
 * Checks performed:
 *  1. STRIPE_SECRET_KEY is set and has a recognised prefix.
 *  2. The key authenticates against the Stripe API (balance.retrieve).
 *  3. Account metadata (id, country, default currency, business name).
 *  4. Tool catalogue loads with the expected count.
 *  5. Node.js version meets the >=20 engines requirement.
 *
 * The doctor never throws — every check is wrapped and produces a CheckResult.
 */
export async function runDoctor(): Promise<boolean> {
  const banner = `StripeFlow doctor ${VERSION} — health check\n${'─'.repeat(56)}`;
  line(banner);
  line('');

  const checks: CheckResult[] = [];

  // Check 1 — environment / key presence.
  const envCheck = checkEnvironment();
  checks.push(envCheck);

  // Check 2 + 3 — live API auth + account metadata (only if a key is present).
  if (envCheck.ok) {
    const authResult = await checkStripeAuth();
    checks.push(authResult);
  } else {
    checks.push({
      name: 'Stripe API auth',
      ok: false,
      detail: 'skipped — no STRIPE_SECRET_KEY set',
    });
  }

  // Check 4 — tool catalogue integrity (pure-local, always runs).
  checks.push(checkToolCatalogue());

  // Check 5 — Node.js version.
  checks.push(checkNodeVersion());

  // Render the report.
  for (const c of checks) {
    const marker = c.ok ? '✓' : '✗';
    const color = c.ok ? '\x1b[32m' : '\x1b[31m'; // green / red
    const reset = '\x1b[0m';
    line(`  ${color}${marker}${reset}  ${c.name}`);
    if (c.detail) line(`      ${c.detail}`);
  }

  line('');
  const allOk = checks.every((c) => c.ok);
  if (allOk) {
    line('\x1b[32m✓ All checks passed.\x1b[0m StripeFlow is ready to run.');
    line('   Start the server:  StripeFlow');
    line('   Or add to your MCP client config (see --help).');
  } else {
    line('\x1b[33m⚠ Some checks failed. See above for details.\x1b[0m');
    line('   Common fixes:');
    line('   • Set STRIPE_SECRET_KEY in your environment (sk_test_... or sk_live_...).');
    line('   • Get a key at https://dashboard.stripe.com/apikeys');
    line('   • Upgrade Node.js to v20+ if the version check failed.');
  }
  line('');
  return allOk;
}

/** Check 1: STRIPE_SECRET_KEY presence + prefix recognition. */
function checkEnvironment(): CheckResult {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      name: 'STRIPE_SECRET_KEY',
      ok: false,
      detail: 'not set. Export STRIPE_SECRET_KEY=sk_test_... before running.',
    };
  }
  if (key.startsWith('sk_test_')) {
    return {
      name: 'STRIPE_SECRET_KEY',
      ok: true,
      detail: `set (test mode, ${key.length} chars). No real charges will be made.`,
    };
  }
  if (key.startsWith('sk_live_')) {
    return {
      name: 'STRIPE_SECRET_KEY',
      ok: true,
      detail: `set (\x1b[33mLIVE mode\x1b[0m, ${key.length} chars). Real money is affected.`,
    };
  }
  if (key.startsWith('rk_')) {
    return {
      name: 'STRIPE_SECRET_KEY',
      ok: true,
      detail: `set (restricted key, ${key.length} chars). Some tools may lack permission.`,
    };
  }
  return {
    name: 'STRIPE_SECRET_KEY',
    ok: false,
    detail: `set but has an unrecognised prefix ("${key.slice(0, 8)}…"). Expected sk_test_ / sk_live_ / rk_.`,
  };
}

/** Check 2 + 3: authenticate + fetch account metadata via balance.retrieve. */
async function checkStripeAuth(): Promise<CheckResult> {
  try {
    const stripe = getStripeClient();
    // balance.retrieve() is the cheapest authenticated call and works for
    // every key type. It also returns the available/pending balances which
    // are useful context for the report.
    const balance = await stripe.balance.retrieve();

    // Fetch account metadata for a richer report. This is a second call but
    // gives country/currency/business name — high value for confirming you're
    // hitting the right account.
    let account: Stripe.Account | null = null;
    try {
      // Pass `null` to retrieve the current account (the account the key
      // belongs to). Restricted keys may lack this permission — degrade.
      account = await stripe.accounts.retrieve(null);
    } catch {
      // Restricted keys may lack account:read — degrade gracefully.
      account = null;
    }

    const avail = balance.available?.[0];
    const pending = balance.pending?.[0];
    const parts: string[] = [];
    parts.push(
      `authenticated${
        account ? ` as ${account.id}` : ''
      } (${config.stripeMode} mode)`,
    );
    if (account) {
      if (account.country) parts.push(`country: ${account.country}`);
      if (account.default_currency) parts.push(`currency: ${account.default_currency.toUpperCase()}`);
      if (account.business_profile?.name) parts.push(`business: "${account.business_profile.name}"`);
    }
    if (avail) {
      parts.push(
        `available: ${formatAmountSafe(avail.amount, avail.currency)} (${avail.amount} ${avail.currency})`,
      );
    }
    if (pending && pending.amount > 0) {
      parts.push(
        `pending: ${formatAmountSafe(pending.amount, pending.currency)} (${pending.amount} ${pending.currency})`,
      );
    }
    return {
      name: 'Stripe API auth',
      ok: true,
      detail: parts.join(' · '),
    };
  } catch (error) {
    return {
      name: 'Stripe API auth',
      ok: false,
      detail: formatStripeError(error).split('\n')[0] ?? 'unknown error',
    };
  } finally {
    // The doctor may be run before/after the server in the same process; drop
    // the cached client so a key change between runs is picked up.
    resetStripeClient();
  }
}

/** Check 4: tool catalogue loads + count matches expectation. */
function checkToolCatalogue(): CheckResult {
  const expected = 79;
  if (TOOL_COUNT >= expected && allTools.length === TOOL_COUNT) {
    return {
      name: 'Tool catalogue',
      ok: true,
      detail: `${TOOL_COUNT} tools loaded across 19 categories.`,
    };
  }
  return {
    name: 'Tool catalogue',
    ok: false,
    detail: `expected ≥${expected} tools, found ${TOOL_COUNT}. The build may be corrupted — reinstall StripeFlow.`,
  };
}

/** Check 5: Node.js version meets the >=20 engines requirement. */
function checkNodeVersion(): CheckResult {
  const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  if (major >= 20) {
    return {
      name: 'Node.js version',
      ok: true,
      detail: `v${process.versions.node} (meets >=20 requirement).`,
    };
  }
  return {
    name: 'Node.js version',
    ok: false,
    detail: `v${process.versions.node} — StripeFlow requires Node.js >=20. Upgrade at https://nodejs.org/`,
  };
}

/** Format a Stripe amount safely (defensive — currency may be missing). */
function formatAmountSafe(amount: number, currency: string): string {
  // Lazy import to avoid a circular dep at module load; currency.ts is pure.
  // We inline a tiny formatter here to keep the doctor self-contained.
  const zeroDecimal = new Set([
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
    'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
  ]);
  const c = (currency || 'usd').toLowerCase();
  if (zeroDecimal.has(c)) return `${amount} ${c.toUpperCase()}`;
  return `${(amount / 100).toFixed(2)} ${c.toUpperCase()}`;
}

const VERSION = '1.0.0';
