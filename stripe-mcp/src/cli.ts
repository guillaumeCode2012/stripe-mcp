import { allTools, TOOL_COUNT } from './tools/index.js';
import { config } from './config.js';

/**
 * Lightweight CLI argument handling for stripe-mcp.
 *
 * Supported flags:
 *   -h, --help          Print usage and exit.
 *   -v, --version       Print package version and exit.
 *   --list-tools        Print every registered tool (name + description) as
 *                       JSON to stdout and exit. Useful for IDE integrations,
 *                       debugging, and generating docs.
 *   --list-categories   Print the distinct tool categories with counts as
 *                       JSON and exit.
 *   (no args)           Run the MCP server over stdio (default behaviour).
 *
 * Returns `true` if a CLI flag was handled (and the process should exit),
 * `false` if the caller should proceed to start the server.
 *
 * The MCP protocol speaks JSON-RPC over stdio, so we write CLI output to
 * stdout for machine-readable flags (--list-tools, --list-categories) and to
 * stderr for human-readable help/version — this keeps the stdio transport
 * clean when the server runs.
 */
export function handleCliArgs(argv: string[]): boolean {
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
    process.stderr.write(`stripe-mcp ${VERSION}\n`);
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
      // Tool names follow `stripe_<category>_<action>` where the action may
      // itself contain underscores (e.g. stripe_analytics_get_mrr). We match
      // against the known category list (longest first so that
      // "payment-intents" wins over "payment-links" style prefixes — though
      // here they're disjoint, the ordering is defensive).
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

  // Unknown flag — warn on stderr but don't crash; fall through to server.
  process.stderr.write(`stripe-mcp: unknown argument(s): ${args.join(' ')}\n`);
  process.stderr.write(`Run 'stripe-mcp --help' for usage.\n`);
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

const HELP_TEXT = `stripe-mcp ${VERSION} — The most complete MCP server for Stripe.

USAGE
  stripe-mcp                  Run the MCP server over stdio (default).
  stripe-mcp <flag>           Run a CLI command instead of the server.

FLAGS
  -h, --help                  Show this help message and exit.
  -v, --version               Print the version and exit.
  --list-tools                Print all ${TOOL_COUNT} registered tools
                              (name + description) as JSON to stdout.
  --list-categories           Print tool categories with counts as JSON.

ENVIRONMENT
  STRIPE_SECRET_KEY           Required. sk_test_... (test) or sk_live_... (live).
                              Get one at https://dashboard.stripe.com/apikeys

CONFIGURATION
  Add to your MCP client config (e.g. claude_desktop_config.json):
  {
    "mcpServers": {
      "stripe": {
        "command": "stripe-mcp",
        "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
      }
    }
  }

MODE
  Current key prefix: ${config.stripeMode === 'live' ? 'sk_live_ (LIVE — real money)' : 'sk_test_ (test — safe)'}

DOCS
  README    https://github.com/stripe-mcp/stripe-mcp#readme
  Stripe    https://stripe.com/docs/api
  MCP       https://modelcontextprotocol.io

stripe-mcp is MIT licensed.
`;
