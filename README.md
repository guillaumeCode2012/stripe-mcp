# StripeFlow

Type-safe Stripe API for AI agents. 79 validated tools. One local process. Zero unsafe API calls.

[![CI](https://img.shields.io/github/actions/workflow/status/guillaumeCode2012/stripeflow/ci.yml?branch=main&label=CI)](https://github.com/guillaumeCode2012/stripeflow/actions)
[![npm version](https://img.shields.io/npm/v/@guillaume_code_2012/stripeflow?color=blue)](https://www.npmjs.com/package/@guillaume_code_2012/stripeflow)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![stars](https://img.shields.io/github/stars/guillaumeCode2012/stripeflow?style=social)](https://github.com/guillaumeCode2012/stripeflow)

<!-- DEMO GIF HERE -->

---

## Quick Install

```bash
npm install -g @guillaume_code_2012/stripeflow
export STRIPE_SECRET_KEY=sk_test_...
```

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripeflow",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

Restart Claude. Done.

---

## Example

A real conversation between an AI agent and StripeFlow.

**User:** "Create a customer named Sarah Chen and subscribe her to the Pro plan."

The agent calls three tools:

```
stripe_customers_create
  → input:  { "name": "Sarah Chen", "email": "sarah@acme.io" }
  → output: { "id": "cus_abc123", "name": "Sarah Chen", "email": "sarah@acme.io", "created": "2026-01-15T10:30:00.000Z" }

stripe_prices_list
  → input:  { "active": true }
  → output: { "data": [{ "id": "price_pro_monthly", "unit_amount": 4900, "currency": "usd", "recurring": { "interval": "month" } }] }

stripe_subscriptions_create
  → input:  { "customer": "cus_abc123", "items": [{ "price": "price_pro_monthly" }] }
  → output: { "id": "sub_xyz789", "status": "active", "current_period_end": 1739668800, "plan": { "amount": 4900, "amount_formatted": "$49.00", "interval": "month" } }
```

Each call is validated. The agent never touches a raw HTTP endpoint. No hallucinated parameters reach Stripe.

---

## Why StripeFlow?

LLMs call APIs with raw JSON. They miss parameters. They skip pagination. They run destructive operations with no confirmation.

The difference between giving an agent a raw API key and a typed tool set:

| | Raw Stripe API | StripeFlow |
|---|---|---|
| Input validation | None — raw JSON reaches Stripe | Zod schemas validate every parameter |
| Pagination | Agent assumes one page = all results | Auto-paginates through every page |
| Currency handling | Cents only — agent must convert | Formatted strings + raw cents on every field |
| Date formatting | Unix only | Unix timestamp + ISO 8601 on every field |
| Key type awareness | Agent doesn't know test vs live | Detects `sk_test_` / `sk_live_` / `rk_`, warns accordingly |
| Error messages | Stripe error codes | Stripe error codes + docs links + formatted messages |
| Destructive operations | Runs immediately | Returns summary before execution |
| Analytics | Requires external service | 5 analytics tools compute locally from Stripe data |
| Local execution | Requires HTTP client | Stdio transport — no server, no ports, no network |

---

## Features

### Safe by design

Every tool input is validated with a Zod schema. The agent cannot send malformed data to Stripe. If a parameter is wrong, StripeFlow rejects it before the API call. The error message includes a link to the relevant Stripe doc page.

Restricted keys (`rk_`) let you limit which resources an agent can access. Read-only agents get read-only keys. Billing agents get write access to subscriptions only. The key scoping happens at the Stripe dashboard level — StripeFlow respects it.

### Typed end-to-end

TypeScript strict mode. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, zero `any`. Stripe SDK types flow from the API response through Zod validation to the MCP tool output. The agent sees a typed, predictable JSON schema every time.

### Auto-pagination

Every list tool iterates through all pages up to a configurable cap (default: 1000 items). The agent asks for "all customers" and gets all customers — not the first 10 and a pagination token it doesn't know how to use.

### Formatted values

Monetary fields return both raw amounts and human-readable strings:

```json
{ "amount": 4900, "amount_formatted": "$49.00" }
```

Date fields return Unix timestamps and ISO 8601:

```json
{ "created": 1739668800, "created_formatted": "2026-01-15T10:30:00.000Z" }
```

The agent presents data to you without guessing about currency decimals or timezone offsets.

### Analytics without a data warehouse

Stripe has no native MRR endpoint. Services like Baremetrics and ChartMogul cost hundreds per month. StripeFlow computes five analytics metrics client-side by paginating your Stripe data:

- Monthly Recurring Revenue — by plan, by currency, with top 10 customers
- Churn rate — over any window, with per-customer churn detail
- Revenue summary — gross, net, refunds, fees, with daily time series
- Top customers — by lifetime value, MRR, or payment count
- Failed payments — by decline code, with per-customer recovery suggestions

No external service. No SQL. No Stripe Sigma.

---

## Architecture

```
Claude Desktop / Cursor / Windsurf
         │
         │  JSON-RPC (stdio)
         ▼
    StripeFlow
    (local Node.js process)
         │
         │  Stripe SDK (HTTPS)
         ▼
    Stripe API
```

StripeFlow runs as a child process of your MCP client. Communication happens over stdin/stdout using the MCP JSON-RPC protocol. Your Stripe key never leaves your machine. No server. No ports. No HTTP endpoints to secure.

---

## All 79 tools

| Category | Tools | Operations |
|---|---|---|
| Customers | 6 | create, get, update, delete, list, search |
| Products | 5 | create, get, update, archive, list |
| Prices | 4 | create, get, update, list |
| Subscriptions | 8 | create, get, update, cancel, pause, resume, list, search |
| Invoices | 6 | get, list, pay, void, finalize, send |
| Payment Intents | 5 | create, get, confirm, cancel, list |
| Refunds | 3 | create, get, list |
| Disputes | 4 | get, update, close, list |
| Webhooks | 5 | create, get, update, delete, list |
| Coupons | 4 | create, get, delete, list |
| Promotion Codes | 3 | create, get, list |
| Payment Links | 4 | create, get, update, list |
| Checkout | 4 | create, get, expire, list |
| Billing Portal | 1 | create session |
| Balance | 2 | get, list transactions |
| Payouts | 4 | create, get, cancel, list |
| Tax | 3 | create, get, list |
| Meters | 3 | create, get, list |
| Analytics | 5 | MRR, churn, revenue, top customers, failed payments |

---

## Safety

StripeFlow detects your key prefix on startup:

| Key type | Behavior |
|---|---|
| `sk_test_` | Safe mode. All operations run against Stripe test mode. No real charges. |
| `sk_live_` | Prints a prominent warning: "LIVE MODE — real charges will be created." |
| `rk_` | Restricted key. Access limited to the resources and permissions you configured in the Stripe dashboard. |

Destructive tools (create, update, delete, cancel, refund) return a confirmation summary before execution. The agent presents it to the user for review.

Read operations (get, list, search, analytics) run immediately with no confirmation step. Roughly half the tool catalog is read-only.

---

## Configuration

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripeflow",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

### Cursor

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripeflow",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripeflow",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

### VS Code / Codex

Add to your MCP config following the [MCP specification](https://modelcontextprotocol.io).

---

## Roadmap

| Milestone | Status |
|---|---|
| v1.0 — 79 tools, 5 analytics, typed schemas, stdio transport | Shipped |
| v1.1 — Multi-account support, webhook event replay, batch operations | In progress |
| v1.2 — Web dashboard, per-tool permission scopes, plugin system | Planned |
| Future — HTTP/SSE transport, OAuth flow, Stripe Sigma integration | Planned |

---

## Development

```bash
git clone https://github.com/guillaumeCode2012/stripeflow.git
cd stripeflow/stripeflow
npm ci
```

| Command | |
|---|---|
| `npm test` | 83 tests, vitest, all Stripe calls mocked |
| `npm run typecheck` | TypeScript strict mode check |
| `npm run lint` | ESLint |
| `npm run build` | tsup bundle to `dist/` |
| `npm run dev` | tsx watch mode |

All quality gates must pass: `npm run typecheck && npm run lint && npm run build && npm test`

### Docker

```bash
docker build -t stripeflow:1.0.0 ./stripeflow
docker run --rm -i -e STRIPE_SECRET_KEY=sk_test_... stripeflow:1.0.0
```

---

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](./stripeflow/CONTRIBUTING.md) for the full guide.

Quick overview:

1. Fork the repo
2. Create a feature branch
3. Add your tool in `src/tools/<category>/`
4. Add tests in `tests/tools/`
5. Run quality gates
6. Open a PR

All contributions must pass the CI matrix (Node 20.x and 22.x, Ubuntu, TypeScript strict mode).

---

## License

MIT — see [LICENSE](./stripeflow/LICENSE).
