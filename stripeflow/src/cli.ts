import { allTools, TOOL_COUNT } from './tools/index.js';
import { config } from './config.js';
import { runDoctor } from './doctor.js';

/**
 * Lightweight CLI argument handling for StripeFlow.
 *
 * Supported flags:
 *   -h, --help          Print usage and exit.
 *   -v, --version       Print package version and exit.
 *   --list-tools        Print every registered tool (name + description) as
 *                       JSON to stdout and exit. Useful for IDE integrations,
 *                       debugging, and generating docs.
 *   --list-categories   Print the distinct tool categories with counts as
 *                       JSON and exit.
 *   --doctor            Run a health check: verifies STRIPE_SECRET_KEY,
 *                       authenticates against Stripe, prints account info,
 *                       and checks the tool catalogue + Node version.
 *                       Prints to stderr; exits 0 on success, 1 on failure.
 *   (no args)           Run the MCP server over stdio (default behaviour).
 *
 * Returns `true` if a CLI flag was handled (and the process should exit),
 * `false` if the caller should proceed to start the server.
 *
 * The MCP protocol speaks JSON-RPC over stdio, so we write CLI output to
 * stdout for machine-readable flags (--list-tools, --list-categories) and to
 * stderr for human-readable help/version/doctor — this keeps the stdio
 * transport clean when the server runs.
 */
export async function handleCliArgs(argv: string[]): Promise<boolean> {
  const args = argv.slice(2);

  if (args.length === 0) {
    return false;
  }

  const has = (flag: string, ...aliases: string[]): boolean =>
    args.includes(flag) || aliases.some((a) => args.includes(a));

  if (has('--help', '-h')) {
    process.stderr.write(HELP_TEXT);
    return true;
  }

  if (has('--version', '-v')) {
    process.stderr.write(`StripeFlow ${VERSION}\n`);
    return true;
  }

  if (has('--list-tools')) {
    const payload = allTools.map((t) => ({
      name: t.definition.name,
      description: t.definition.description ?? '',
    }));
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return true;
  }

  if (has('--list-categories')) {
    const counts = new Map<string, number>();
    for (const t of allTools) {
      const name = t.definition.name;
      const category = KNOWN_CATEGORIES.find((c) =>
        name.startsWith(`stripe_${c.replace(/-/g, '_')}_`),
      );
      counts.set(category ?? 'unknown', (counts.get(category ?? 'unknown') ?? 0) + 1);
    }
    const payload = Array.from(counts.entries())
      .filter(([category]) => category !== 'unknown')
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
    process.stdout.write(`${JSON.stringify({ total: TOOL_COUNT, categories: payload }, null, 2)}\n`);
    return true;
  }

  if (has('--doctor')) {
    const allOk = await runDoctor();
    // The caller (index.ts main) will exit 0 on return; signal failure via
    // process.exitCode so any pending I/O flushes first.
    if (!allOk) process.exitCode = 1;
    return true;
  }

  // Unknown flag — warn on stderr but don't crash; fall through to server.
  process.stderr.write(`StripeFlow: unknown argument(s): ${args.join(' ')}\n`);
  process.stderr.write(`Run 'StripeFlow --help' for usage.\n`);
  return false;
}

const VERSION = '1.0.0';

/**
 * The 19 tool categories in display (hyphenated) form. Sorted longest-first
 * so prefix matching is unambiguous (defensive — current names are disjoint).
 * Used by --list-categories to bucket tools without relying on underscore
 * splitting (which breaks on multi-word actions like `get_mrr`).
 */
const KNOWN_CATEGORIES = [
  'billing-portal',
  'promotion-codes',
  'payment-intents',
  'payment-links',
  'subscriptions',
  'customers',
  'products',
  'invoices',
  'refunds',
  'disputes',
  'webhooks',
  'coupons',
  'checkout',
  'balance',
  'payouts',
  'meters',
  'prices',
  'analytics',
  'tax',
].sort((a, b) => b.length - a.length);

const HELP_TEXT = `StripeFlow ${VERSION} — The most complete MCP server for Stripe.

USAGE
  stripeflow                  Run the MCP server over stdio (default).
  stripeflow <flag>           Run a CLI command instead of the server.

FLAGS
  -h, --help                  Show this help message and exit.
  -v, --version               Print the version and exit.
  --list-tools                Print all ${TOOL_COUNT} registered tools
                              (name + description) as JSON to stdout.
  --list-categories           Print tool categories with counts as JSON.
  --doctor                    Run a health check: verifies your Stripe key,
                              authenticates, prints account info, and checks
                              the tool catalogue + Node version. Exits 1 on
                              failure. Great for debugging install issues.

ENVIRONMENT
  STRIPE_SECRET_KEY           Required. sk_test_... (test) or sk_live_... (live).
                              Get one at https://dashboard.stripe.com/apikeys

CONFIGURATION
  Add to your MCP client config (e.g. claude_desktop_config.json):
  {
    "mcpServers": {
      "stripe": {
        "command": "stripeflow",
        "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
      }
    }
  }

MODE
  Current key prefix: ${config.stripeMode === 'live' ? 'sk_live_ (LIVE — real money)' : 'sk_test_ (test — safe)'}

DOCS
  README    https://github.com/guillaumeCode2012/stripeflow#readme
  Stripe    https://stripe.com/docs/api
  MCP       https://modelcontextprotocol.io

StripeFlow is MIT licensed.
`;
