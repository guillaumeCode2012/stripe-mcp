# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025

### Initial release

StripeFlow is the most complete open-source MCP server for Stripe. Manage your
entire Stripe account — customers, subscriptions, invoices, payouts, and
analytics — with natural language. Works with Claude Desktop, Cursor, Windsurf,
and any MCP-compatible client.

### Added — 79 tools across 19 categories

- **Customers (6)** — `stripe_customers_create`, `stripe_customers_get`,
  `stripe_customers_update`, `stripe_customers_delete`, `stripe_customers_list`,
  `stripe_customers_search`
- **Products (5)** — `stripe_products_create`, `stripe_products_get`,
  `stripe_products_update`, `stripe_products_archive`, `stripe_products_list`
- **Prices (4)** — `stripe_prices_create`, `stripe_prices_get`,
  `stripe_prices_update`, `stripe_prices_list`
- **Subscriptions (8)** — `stripe_subscriptions_create`, `stripe_subscriptions_get`,
  `stripe_subscriptions_update`, `stripe_subscriptions_cancel`,
  `stripe_subscriptions_pause`, `stripe_subscriptions_resume`,
  `stripe_subscriptions_list`, `stripe_subscriptions_search`
- **Invoices (6)** — `stripe_invoices_get`, `stripe_invoices_list`,
  `stripe_invoices_pay`, `stripe_invoices_void`, `stripe_invoices_finalize`,
  `stripe_invoices_send`
- **Payment Intents (5)** — `stripe_payment_intents_create`,
  `stripe_payment_intents_get`, `stripe_payment_intents_confirm`,
  `stripe_payment_intents_cancel`, `stripe_payment_intents_list`
- **Refunds (3)** — `stripe_refunds_create`, `stripe_refunds_get`,
  `stripe_refunds_list`
- **Disputes (4)** — `stripe_disputes_get`, `stripe_disputes_update`,
  `stripe_disputes_close`, `stripe_disputes_list`
- **Webhooks (5)** — `stripe_webhooks_create`, `stripe_webhooks_get`,
  `stripe_webhooks_update`, `stripe_webhooks_delete`, `stripe_webhooks_list`
- **Coupons (4)** — `stripe_coupons_create`, `stripe_coupons_get`,
  `stripe_coupons_delete`, `stripe_coupons_list`
- **Promotion Codes (3)** — `stripe_promotion_codes_create`,
  `stripe_promotion_codes_get`, `stripe_promotion_codes_list`
- **Payment Links (4)** — `stripe_payment_links_create`,
  `stripe_payment_links_get`, `stripe_payment_links_update`,
  `stripe_payment_links_list`
- **Checkout (4)** — `stripe_checkout_create_session`,
  `stripe_checkout_get_session`, `stripe_checkout_expire_session`,
  `stripe_checkout_list_sessions`
- **Billing Portal (1)** — `stripe_billing_portal_create_session`
- **Balance (2)** — `stripe_balance_get`,
  `stripe_balance_list_transactions`
- **Payouts (4)** — `stripe_payouts_create`, `stripe_payouts_get`,
  `stripe_payouts_cancel`, `stripe_payouts_list`
- **Tax (3)** — `stripe_tax_create_rate`, `stripe_tax_get_rate`,
  `stripe_tax_list_rates`
- **Meters (3)** — `stripe_meters_create`, `stripe_meters_get`,
  `stripe_meters_list`
- **Analytics (5) — the crown jewel** — `stripe_analytics_get_mrr`,
  `stripe_analytics_get_churn_rate`, `stripe_analytics_get_revenue_summary`,
  `stripe_analytics_get_top_customers`, `stripe_analytics_get_failed_payments_report`

### Added — analytics crown jewel

Five first-of-their-kind analytics tools that compute MRR, churn, revenue
summaries, top customers, and failed-payment reports by paginating Stripe
resources client-side and aggregating locally. No other Stripe MCP server ships
these — Stripe has no native MRR or churn endpoint, so the analytics tools
implement the canonical Baremetrics/ChartMogul methodology themselves.

### Added — platform

- ESM-first build via tsup, output to `dist/` with a `#!/usr/bin/env node` banner
- TypeScript strict mode (`strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noImplicitOverride`)
- Zod runtime validation on every tool input
- JSON-Schema `inputSchema` mirrored from the zod schema on every tool
- Auto-pagination via `paginateAll<T>` for every list endpoint, capped by
  `max_items` (default 1000)
- Standardized list envelope: `{ total_count, has_more, data }`
- Money formatting via `formatAmount` (handles 0-, 2-, and 3-decimal currencies)
- `normalizeToMonthly` helper for recurring-price → MRR conversion
- Dual date formats on every timestamp (Unix seconds + ISO 8601 string)
- Human-readable Stripe error formatting via `formatStripeError` (with docs
  links and decline-code references)
- stdio transport only — no HTTP server, no ports, no auth
- `buildStripeParams<P>` helper for `exactOptionalPropertyTypes`-safe SDK calls
- Tool registry pattern with a pre-wired category barrel (`src/tools/index.ts`)
  so parallel contributors never collide

### Added — tests & CI

- Vitest test suite with `vi.mock()` on the Stripe client — no real Stripe
  calls in CI
- Test coverage for currency/date utils, `formatStripeError`, and selected
  tools (customers, subscriptions, invoices, analytics)
- GitHub Actions CI matrix on Node.js 20.x and 22.x running typecheck, lint,
  build, and tests
- GitHub Actions release workflow that publishes to npm on `v*` tags

### Added — docs

- `README.md` — viral, developer-first landing doc with the full 79-tool table
- `CONTRIBUTING.md` — setup, dev workflow, project structure, tool template,
  code style, PR checklist
- `DECISIONS.md` — architecture decision records
- `CLAUDE.md` — agent-facing project rules
- `docs/tools/*.md` — one reference file per category (19 files)
- `LICENSE` — MIT

### Known limitations

- `stripe_subscriptions_search` returns a single page (Stripe search uses
  `next_page` pagination, intentionally not auto-paginated to keep search
  responsive)
- `stripe_analytics_*` tools compute client-side and may be slow on accounts
  with > 50,000 charges; cap defaults bound the work
- API version is intentionally not pinned — see `DECISIONS.md` 008

[1.0.0]: https://github.com/guillaumeCode2012/stripeflow/releases/tag/v1.0.0
