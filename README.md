```
  ⚡
  ███████ ███████ ███████ ███████ ███████ ███████ ███████ ███████████
 ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░░░░░███░░░░
 ░███    ░███    ░███    ░███    ░███    ░███    ░███        ░███
 ░███████░██████ ░███████░███████░███████░███████░███████    ░███
 ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░ ░███░░░     ░███
 ░███    ░███    ░███    ░███    ░███    ░███    ░███        ░███
 ░███████░██████ ███████░███████░███    ░███    ░██████     ░███
 ░░░░░░░ ░░░░░░ ░░░░░░░ ░░░░░░░ ░░░     ░░░     ░░░░░░      ░░░
```

# stripe-mcp

> **The most complete open-source MCP server for Stripe.** 79 tools. 19 categories. One command.

[![CI](https://img.shields.io/github/actions/workflow/status/guillaumeCode2012/stripe-mcp/ci.yml?branch=main&label=CI)](https://github.com/guillaumeCode2012/stripe-mcp/actions)
[![MIT license](https://img.shields.io/badge/license-MIT-green)](./stripe-mcp/LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-purple)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./stripe-mcp/tsconfig.json)
[![Stars](https://img.shields.io/github/stars/guillaumeCode2012/stripe-mcp?style=social)](https://github.com/guillaumeCode2012/stripe-mcp)

---

## Why this exists

- **No other Stripe MCP has analytics.** MRR, churn, revenue summaries, top customers, failed-payment reports — all computed client-side. Stripe has no native MRR endpoint; we implemented the canonical Baremetrics/ChartMogul methodology.
- **One command to install.** `npm install -g @guillaume_code_2012/stripe-mcp` and you're talking to Stripe from Claude in 30 seconds. No servers, no ports, no auth headers.
- **Typed end-to-end.** TypeScript strict mode, zod runtime validation on every input, zero `any`. Stripe SDK types flow all the way through.

---

## Quick start

**1. Install**

```bash
npm install -g @guillaume_code_2012/stripe-mcp
```

**2. Get a Stripe secret key**

Grab a restricted test key from the [Stripe dashboard](https://dashboard.stripe.com/apikeys). It starts with `sk_test_`.

```bash
export STRIPE_SECRET_KEY=sk_test_...
```

**3. Wire it into your MCP client**

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripe-mcp",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripe-mcp",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

**Windsurf** — `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "stripe-mcp",
      "env": { "STRIPE_SECRET_KEY": "sk_test_..." }
    }
  }
}
```

---

## Tools (79 across 19 categories)

| Category | Tools | |
|---|---|---|
| **Customers** | create, get, update, delete, list, search | 6 |
| **Products** | create, get, update, archive, list | 5 |
| **Prices** | create, get, update, list | 4 |
| **Subscriptions** | create, get, update, cancel, pause, resume, list, search | 8 |
| **Invoices** | get, list, pay, void, finalize, send | 6 |
| **Payment Intents** | create, get, confirm, cancel, list | 5 |
| **Refunds** | create, get, list | 3 |
| **Disputes** | get, update, close, list | 4 |
| **Webhooks** | create, get, update, delete, list | 5 |
| **Coupons** | create, get, delete, list | 4 |
| **Promotion Codes** | create, get, list | 3 |
| **Payment Links** | create, get, update, list | 4 |
| **Checkout** | create, get, expire, list sessions | 4 |
| **Billing Portal** | create session | 1 |
| **Balance** | get, list transactions | 2 |
| **Payouts** | create, get, cancel, list | 4 |
| **Tax** | create, get, list rates | 3 |
| **Meters** | create, get, list | 3 |
| **Analytics** | MRR, churn rate, revenue summary, top customers, failed payments | 5 |
| **Total** | | **79** |

### Analytics (the crown jewel)

Stripe has no native MRR endpoint. stripe-mcp computes MRR, churn, revenue, top customers, and failed-payment reports entirely client-side by paginating Stripe resources — the same methodology used by Baremetrics and ChartMogul.

---

## Example prompts

```
Show me my current MRR and which plan is growing fastest
```

```
List all customers who churned in the last 30 days
```

```
Create a $29/month Pro subscription for cus_abc123
```

```
What was my revenue last month, and how does it compare to the month before?
```

```
Find all failed payments from the last week and suggest recovery actions
```

```
Create a 20% off coupon valid for 3 months, then list all active coupons
```

---

## Architecture

```
stripe-mcp/
├── src/
│   ├── index.ts          # Entry point — StdioServerTransport
│   ├── server.ts         # createServer() — registers all 79 tools
│   ├── config.ts         # Stripe client factory + key type detection
│   ├── cli.ts            # --help, --version, --list-tools, --doctor
│   ├── doctor.ts         # Health diagnostic (5 checks)
│   ├── types/            # ToolDefinition, JsonSchemaProperty
│   ├── utils/            # pagination, currency, date, errors
│   └── tools/            # 19 category folders, 79 tools
├── tests/                # Vitest — all Stripe calls mocked
├── dist/                 # Bundled output (tsup, ESM, Node 20+)
└── docs/                 # Per-category tool documentation
```

**Key design decisions** ([DECISIONS.md](./stripe-mcp/DECISIONS.md)):

- **Stdio only** — no HTTP, no ports, no auth headers. Spawned as a child process by your MCP client.
- **Zod everywhere** — every input runtime-validated. JSON Schemas mirrored for MCP protocol.
- **Auto-pagination** — list tools paginate through ALL results. Never a partial page.
- **Dual formatting** — monetary values returned as both raw cents and human-readable `"$12.50"`. Dates as both Unix timestamp and ISO 8601.
- **Mocked tests** — zero real Stripe API calls in CI. 83 tests, 100% pass rate.

---

## Development

```bash
git clone https://github.com/guillaumeCode2012/stripe-mcp.git
cd stripe-mcp/stripe-mcp
npm ci
```

| Command | Does |
|---|---|
| `npm test` | Run 83 tests (vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run build` | Build to `dist/` |
| `npm run dev` | Dev mode with watch |

**Quality gates** (must pass before push):
1. `npm run typecheck` → zero errors
2. `npm run lint` → zero warnings
3. `npm run build` → succeeds
4. `npm test` → all 83 pass
5. `node dist/index.js --list-tools` → no errors

See [CONTRIBUTING.md](./stripe-mcp/CONTRIBUTING.md) for the guide on adding new tools.

---

## CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| **CI** | Push/PR to `main` | TypeScript, lint, build, test (Node 20 & 22) |
| **Release** | Tag `v*` | Build, test, publish to npm |

---

## Docker

```bash
docker build -t stripe-mcp:1.0.0 ./stripe-mcp
docker run --rm -i -e STRIPE_SECRET_KEY=sk_test_... stripe-mcp:1.0.0
```

See [Dockerfile](./stripe-mcp/Dockerfile) and [docker-compose.yml](./stripe-mcp/docker-compose.yml).

---

## Safety

- **`sk_test_`** keys → safe, no real money. Green indicator on startup.
- **`sk_live_`** keys → prominent red warning: "LIVE MODE — real money."
- **`rk_`** restricted keys → recommended for production. Scope by resource.
- **Destructive actions** → always return a summary for human review before execution.

---

## FAQ

**Does this require a server?** No. Runs locally via stdio. No ports, no infrastructure.

**Is it safe for production?** Yes. Use a `rk_` restricted key scoped to the resources you need.

**What clients does it work with?** Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

---

## License

MIT — see [LICENSE](./stripe-mcp/LICENSE).
