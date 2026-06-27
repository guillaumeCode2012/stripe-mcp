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

> **The most complete open-source MCP server for Stripe.**

![npm version](https://img.shields.io/npm/v/stripe-mcp?color=blue)
![MIT license](https://img.shields.io/badge/license-MIT-green)
![MCP Compatible](https://img.shields.io/badge/MCP-compatible-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Build Status](https://img.shields.io/github/actions/workflow/status/stripe-mcp/stripe-mcp/ci.yml?branch=main&label=CI)
![Stars](https://img.shields.io/github/stars/stripe-mcp/stripe-mcp?style=social)

**Manage your entire Stripe account — customers, subscriptions, invoices, and analytics — with natural language. 79 tools. One command. Works with Claude Desktop, Cursor, and Windsurf.**

---

## Why this exists

- **No other Stripe MCP has analytics.** MRR, churn, revenue summaries, top customers, failed-payment reports — all computed client-side. Stripe has no native MRR endpoint; we implemented the canonical Baremetrics/ChartMogul methodology.
- **One command to install.** `npm install -g stripe-mcp` and you're talking to Stripe from Claude in 30 seconds. No servers, no ports, no auth headers.
- **Typed end-to-end.** TypeScript strict mode, zod runtime validation on every input, zero `any`. Stripe SDK types flow all the way through to the LLM.

## Quick start

**1. Install**

```bash
npm install -g stripe-mcp
```

**2. Get a Stripe secret key**

Grab a restricted test key from the [Stripe dashboard](https://dashboard.stripe.com/apikeys). It starts with `sk_test_`.

```bash
export STRIPE_SECRET_KEY=sk_test_...
```

**3. Wire it into your MCP client**

**Claude Desktop** — edit `claude_desktop_config.json` (macOS:
`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

**Cursor** — `Settings → MCP → Add new MCP server`:

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

**Windsurf** — `Settings → MCP Servers → Add Server`, same JSON shape.

Restart your client. You should see `stripe-mcp` log `✓ Test mode (no real charges).` and you're live.

## Compatible with

✅ Claude Desktop · ✅ Cursor · ✅ Windsurf · ✅ Any MCP-compatible client

---

## The 79 tools

Grouped by category. Every tool takes JSON input, validates it with zod, calls Stripe, and returns pretty-printed JSON or a human-readable error. List tools auto-paginate and return `{ total_count, has_more, data }`.

### Customers (6)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_customers_create` | Create a new customer with email, name, address, metadata. | "Create a customer for jane@acme.com with the name Jane Doe." |
| `stripe_customers_get` | Retrieve a single customer by ID, with optional expansions. | "Show me everything about customer cus_abc123." |
| `stripe_customers_update` | Update email, name, phone, description, or metadata. | "Update cus_abc123's email to jane@newco.com." |
| `stripe_customers_delete` | Permanently delete a customer (cancels active subscriptions). | "GDPR delete request — wipe customer cus_abc123." |
| `stripe_customers_list` | List customers, auto-paginated, optional exact-email filter. | "List all customers with the email support@acme.com." |
| `stripe_customers_search` | Search customers with Stripe Search Query Language. | "Find customers whose name contains 'Acme'." |

### Products (5)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_products_create` | Create a new product (name, description, images, default price). | "Create a product called 'Pro Plan' with description 'For teams'." |
| `stripe_products_get` | Retrieve a single product by ID. | "Show me product prod_abc123." |
| `stripe_products_update` | Update name, description, images, metadata, or default price. | "Rename prod_abc123 to 'Pro Plan v2'." |
| `stripe_products_archive` | Archive a product by setting active=false (recommended over delete). | "Archive prod_abc123 — we no longer sell it." |
| `stripe_products_list` | List products, optional active/ids filters. | "List all active products." |

### Prices (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_prices_create` | Create a one-time or recurring price (cents + currency + product). | "Create a $29/month recurring price for prod_pro." |
| `stripe_prices_get` | Retrieve a single price by ID. | "Show me price price_abc123." |
| `stripe_prices_update` | Update nickname, lookup_key, metadata, or active flag. | "Set the nickname of price_abc123 to 'Pro Monthly'." |
| `stripe_prices_list` | List prices, optional active/product/type filters. | "List all recurring prices for prod_pro." |

### Subscriptions (8)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_subscriptions_create` | Subscribe a customer to one or more prices, with optional trial/coupon. | "Subscribe cus_abc to price_pro with a 14-day trial." |
| `stripe_subscriptions_get` | Retrieve a subscription by ID. | "Show me sub_abc123 with its latest invoice expanded." |
| `stripe_subscriptions_update` | Change items, coupon, proration, or schedule cancel-at-period-end. | "Upgrade sub_abc123 from Pro to Enterprise." |
| `stripe_subscriptions_cancel` | Cancel immediately with optional proration and feedback. | "Cancel sub_abc123 — customer said it was too expensive." |
| `stripe_subscriptions_pause` | Pause collection cycle (void / mark_uncollectible / keep_as_draft). | "Pause sub_abc123 for 30 days starting today." |
| `stripe_subscriptions_resume` | Resume a paused subscription. | "Resume sub_abc123 — customer is back from vacation." |
| `stripe_subscriptions_list` | List subscriptions, filter by status/customer/price. | "List all past_due subscriptions." |
| `stripe_subscriptions_search` | Search subscriptions with Stripe Search Query Language. | "Find subscriptions with metadata.team_id='42'." |

### Invoices (6)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_invoices_get` | Retrieve a single invoice by ID. | "Show me invoice in_abc123 with line items expanded." |
| `stripe_invoices_list` | List invoices, filter by customer/status/subscription. | "List all open invoices for cus_abc123." |
| `stripe_invoices_pay` | Pay a draft or open invoice, optionally out-of-band. | "Pay invoice in_abc123 with the customer's default payment method." |
| `stripe_invoices_void` | Mark an open invoice as void (irreversible). | "Void invoice in_abc123 — it was issued in error." |
| `stripe_invoices_finalize` | Advance a draft invoice to open status. | "Finalize invoice in_abc123 so we can email it." |
| `stripe_invoices_send` | Email an invoice to the customer. | "Send invoice in_abc123 to the customer now." |

### Payment Intents (5)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_payment_intents_create` | Create a PaymentIntent for a one-time charge. | "Create a $49 PaymentIntent in USD for cus_abc123." |
| `stripe_payment_intents_get` | Retrieve a PaymentIntent by ID. | "Show me payment intent pi_abc123 — what's the status?" |
| `stripe_payment_intents_confirm` | Confirm a PaymentIntent to kickstart payment processing. | "Confirm pi_abc123 with payment method pm_card_visa." |
| `stripe_payment_intents_cancel` | Cancel an uncaptured PaymentIntent. | "Cancel pi_abc123 — the customer abandoned checkout." |
| `stripe_payment_intents_list` | List PaymentIntents, filter by customer or status. | "List all succeeded PaymentIntents for cus_abc123." |

### Refunds (3)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_refunds_create` | Refund a charge or PaymentIntent (full or partial). | "Refund $25 from pi_abc123 — customer was overcharged." |
| `stripe_refunds_get` | Retrieve a single refund by ID. | "Show me refund re_abc123 — has it settled?" |
| `stripe_refunds_list` | List refunds, filter by charge or PaymentIntent. | "List all refunds issued against pi_abc123." |

### Disputes (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_disputes_get` | Retrieve a single dispute by ID. | "Show me dispute dp_abc123 — what's the evidence deadline?" |
| `stripe_disputes_update` | Attach evidence or metadata; optionally submit. | "Submit this shipping tracking number as evidence for dp_abc123." |
| `stripe_disputes_close` | Close (forfeit) a dispute. | "We're not contesting dp_abc123 — close it." |
| `stripe_disputes_list` | List disputes, filter by charge or PaymentIntent. | "List all open disputes from the last 30 days." |

### Webhooks (5)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_webhooks_create` | Register a webhook endpoint with a list of events. | "Create a webhook at https://api.acme.com/stripe for charge.succeeded and invoice.paid." |
| `stripe_webhooks_get` | Retrieve a webhook endpoint by ID. | "Show me webhook we_abc123 — what events is it subscribed to?" |
| `stripe_webhooks_update` | Update URL, events, description, disabled flag. | "Disable webhook we_abc123 — we're migrating endpoints." |
| `stripe_webhooks_delete` | Permanently delete a webhook endpoint. | "Delete webhook we_abc123 — receiver is decommissioned." |
| `stripe_webhooks_list` | List all webhook endpoints. | "List all webhooks on this account." |

### Coupons (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_coupons_create` | Create a percent-off or amount-off coupon (once / repeating / forever). | "Create a 50% off coupon that lasts 3 months." |
| `stripe_coupons_get` | Retrieve a coupon by ID. | "Show me coupon 25OFF — how many times has it been redeemed?" |
| `stripe_coupons_delete` | Delete a coupon (existing customers keep their discount). | "Delete coupon SUMMER24 — promo is over." |
| `stripe_coupons_list` | List all coupons. | "List every coupon on the account." |

### Promotion Codes (3)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_promotion_codes_create` | Create a customer-redeemable code backed by a coupon. | "Create promo code WELCOME20 from coupon 25OFF, max 100 redemptions." |
| `stripe_promotion_codes_get` | Retrieve a promotion code by ID. | "Show me promo_abc123 — how many times has it been redeemed?" |
| `stripe_promotion_codes_list` | List promotion codes, optional coupon/active filter. | "List all active promotion codes for coupon 25OFF." |

### Payment Links (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_payment_links_create` | Create a hosted Payment Link URL for one or more products. | "Create a payment link for the Pro plan, quantity 1." |
| `stripe_payment_links_get` | Retrieve a Payment Link by ID. | "Show me plink_abc123 — what's the URL?" |
| `stripe_payment_links_update` | Update active state, line items, or metadata. | "Deactivate plink_abc123 — we're sold out." |
| `stripe_payment_links_list` | List all Payment Links. | "List every payment link on the account." |

### Checkout (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_checkout_create_session` | Create a Checkout Session (payment / subscription / setup mode). | "Create a checkout session for $49 USD, success URL /thanks, cancel /cart." |
| `stripe_checkout_get_session` | Retrieve a Checkout Session by ID. | "Show me cs_test_abc123 — did the customer pay?" |
| `stripe_checkout_expire_session` | Expire an open Checkout Session. | "Expire cs_test_abc123 — customer abandoned it." |
| `stripe_checkout_list_sessions` | List Checkout Sessions, filter by status/customer/payment_link. | "List all completed checkout sessions from last week." |

### Billing Portal (1)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_billing_portal_create_session` | Create a short-lived Customer Portal URL for self-service billing. | "Give cus_abc123 a link to update their payment method." |

### Balance (2)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_balance_get` | Retrieve the current account balance across all currencies. | "What's my available Stripe balance right now?" |
| `stripe_balance_list_transactions` | List transactions contributing to the balance, filter by type/payout. | "Show me every refund transaction from the last 30 days." |

### Payouts (4)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_payouts_create` | Manually payout funds to a bank account or card. | "Payout $5000 to my default bank account in USD." |
| `stripe_payouts_get` | Retrieve a payout by ID. | "Show me po_abc123 — has it arrived yet?" |
| `stripe_payouts_cancel` | Cancel a pending payout (automatic payouts can't be canceled). | "Cancel po_abc123 — I made a mistake." |
| `stripe_payouts_list` | List payouts, filter by status/arrival_date/destination. | "List every failed payout this month." |

### Tax (3)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_tax_create_rate` | Create a manual tax rate (display name, percentage, inclusive flag). | "Create an 8.5% exclusive California sales tax rate." |
| `stripe_tax_get_rate` | Retrieve a tax rate by ID. | "Show me tax rate txr_abc123." |
| `stripe_tax_list_rates` | List tax rates, optional active filter. | "List every active tax rate." |

### Meters (3)

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_meters_create` | Create a billing meter for usage-based pricing. | "Create a meter called 'API Calls' on event api_calls, sum aggregation." |
| `stripe_meters_get` | Retrieve a billing meter by ID. | "Show me meter_abc123 — what's its event name?" |
| `stripe_meters_list` | List all billing meters. | "List every billing meter on the account." |

### ⚡ Analytics (5) — the crown jewel

These are the killer feature. **No other Stripe MCP server has them.** They compute MRR, churn, revenue summaries, top customers, and failed-payment reports by paginating Stripe resources client-side and aggregating locally — Stripe has no native MRR endpoint, so we implement the canonical Baremetrics/ChartMogul methodology ourselves.

| Tool | What it does | Example prompt |
| --- | --- | --- |
| `stripe_analytics_get_mrr` | Compute Monthly Recurring Revenue with by-plan, by-currency, and top-customer breakdowns. | "Show me my MRR and which plan is growing fastest." |
| `stripe_analytics_get_churn_rate` | Compute subscription churn rate for any period, with per-customer LTV estimates. | "What's my churn rate over the last 90 days?" |
| `stripe_analytics_get_revenue_summary` | Aggregate gross/net revenue, refunds, payment counts, failure rate, and a time series. | "Give me a revenue summary for the last 30 days." |
| `stripe_analytics_get_top_customers` | Rank customers by lifetime value, MRR, or payment count. | "Who are my top 10 customers by lifetime value?" |
| `stripe_analytics_get_failed_payments_report` | Break down failed charges by decline code with per-customer recovery suggestions. | "List all failed payments from the last 30 days with failure reasons." |

---

## Analytics spotlight

Stripe exposes no MRR endpoint, no churn endpoint, no "revenue summary" endpoint. Every other Stripe MCP server punts on analytics. We didn't.

### What each tool returns

**`stripe_analytics_get_mrr`** — `{ total_mrr, total_mrr_formatted, mrr_by_plan, mrr_by_currency, top_customers_by_mrr, active_subscription_count, currency, computed_at }`

**`stripe_analytics_get_churn_rate`** — `{ churn_rate_percent, churned_count, active_at_period_start, period_start, period_end, interval, churned_customers: [{ subscription_id, customer_id, email, canceled_at, canceled_at_iso, lifetime_value_estimate, cancellation_reason }] }`

**`stripe_analytics_get_revenue_summary`** — `{ gross_revenue, net_revenue, refund_amount, refund_rate_percent, successful_payments, failed_payments, failure_rate_percent, avg_transaction_value, time_series: [{ date, gross, net, count }] }`

**`stripe_analytics_get_top_customers`** — `{ metric, metric_label, period_days, ranked: [{ rank, customer_id, email, name, value, value_formatted, metric_label }] }`

**`stripe_analytics_get_failed_payments_report`** — `{ total_failed_amount, count, failure_reasons_breakdown: { [decline_code]: { count, amount } }, affected_customers: [{ customer_id, email, failed_count, failed_amount, last_failure_decline_code, last_failure_at_iso, recovery_suggestion }] }`

### Sample conversation

> **You**: Show me my MRR and which plan is growing fastest.

`stripe_analytics_get_mrr` runs, paginates every active subscription, normalizes yearly/weekly/daily prices to monthly, and returns:

```json
{
  "total_mrr": 5280.00,
  "total_mrr_formatted": "$5280.00",
  "mrr_by_plan": {
    "Pro":     { "mrr": 3000.00, "customer_count": 150 },
    "Annual":  { "mrr": 2280.00, "customer_count": 190 }
  },
  "mrr_by_currency": { "usd": 5280.00, "eur": 1190.00 },
  "top_customers_by_mrr": [
    { "customer_id": "cus_1", "email": "acme@example.com", "name": "Acme", "mrr": 499.00, "mrr_formatted": "$499.00" },
    { "customer_id": "cus_2", "email": "globex@example.com", "name": "Globex", "mrr": 299.00, "mrr_formatted": "$299.00" }
  ],
  "active_subscription_count": 340,
  "currency": "usd",
  "computed_at": "2025-01-15T10:30:00.000Z"
}
```

The LLM reads the JSON, you get a natural-language answer: _"Your MRR is $5,280.00 across 340 active subscriptions. The Pro plan is growing fastest — it's contributing $3,000/mo across 150 customers vs the Annual plan at $2,280/mo across 190 customers. You also have €1,190/mo in EUR. Your top MRR customer is Acme at $499/mo."_

No CSV exports, no SQL, no ChartMogul subscription. Just ask.

---

## Example prompts

Curated power-user prompts. Drop these into Claude/Cursor/Windsurf and watch them chain multiple tools together.

1. **"Show me my MRR and which plan is growing fastest."**
2. **"Cancel the subscription for john@example.com and refund his last invoice."**
3. **"List all failed payments from the last 30 days with failure reasons."**
4. **"Create a 3-month 50% off coupon and generate a payment link for the Pro plan."**
5. **"Who are my top 10 customers by lifetime value?"**
6. **"Pause every subscription for customer cus_abc and tell me when you're done."**
7. **"Finalize and send all open invoices."**
8. **"What's my churn rate over the last 90 days?"**

---

## Safety

### Test vs live mode

stripe-mcp detects your key prefix at startup and warns you clearly:

```
⚠️  LIVE MODE — real money affected. Proceed with caution.
```

or

```
✓ Test mode (no real charges).
```

- **`sk_test_...`** → test mode. No real charges, no real customers, no real money. Recommended for first runs.
- **`sk_live_...`** → live mode. Real money. stripe-mcp logs a loud warning on startup.

**Start with a test key.** Don't wire a live key into Claude Desktop until you've poked around test mode for an afternoon.

### Read-only vs destructive tools

**Read-only (safe to let the LLM run freely):**

- `*_get`, `*_list`, `*_search`
- `stripe_balance_get`, `stripe_balance_list_transactions`
- All five `stripe_analytics_*` tools

**Destructive (real money / state changes):**

- `*_create`, `*_update`, `*_delete`, `*_cancel`
- `stripe_refunds_create`, `stripe_invoices_pay`, `stripe_invoices_void`
- `stripe_subscriptions_cancel`, `stripe_customers_delete`, `stripe_webhooks_delete`
- `stripe_payouts_create`, `stripe_payouts_cancel`
- `stripe_checkout_expire_session`, `stripe_disputes_close`

The MCP protocol doesn't (yet) have a built-in read-only mode — your client
may. For full safety, point Claude at a test-mode key and a restricted key
with only the permissions you want to grant.

---

## Architecture

- **ESM-first.** Node 20+, no CommonJS interop. `tsup` builds `dist/index.js` with a `#!/usr/bin/env node` banner.
- **TypeScript strict.** `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Zero `any` anywhere.
- **Zod-validated inputs.** Every tool declares a zod schema, calls `safeParse`, and returns `Validation error: ...` on bad input. The JSON-Schema in the MCP manifest is mirrored by hand from the zod schema so the LLM sees accurate descriptions.
- **stdio transport only.** No HTTP server, no ports, no auth. Universal MCP standard for local tools.
- **Mocked tests.** `vi.mock()` on the Stripe client. No real Stripe calls in CI.
- **Auto-pagination.** `paginateAll<T>` walks every page (capped by `max_items`, default 1000) and returns `{ total_count, has_more, data }`.
- **`buildStripeParams<P>`** helper that drops `undefined` keys so zod-validated input flows into typed Stripe SDK calls without fighting `exactOptionalPropertyTypes`.

See [`DECISIONS.md`](./DECISIONS.md) for the why behind each of these.

---

## Development

```bash
git clone https://github.com/stripe-mcp/stripe-mcp.git
cd stripe-mcp
npm install
npm run build
npm test
npm run typecheck
npm run lint
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide — adding a new
tool takes about 15 minutes and follows a strict template (zod schema, mirrored
JSON-Schema, `buildStripeParams<P>` for the Stripe call, `formatStripeError`
on catch, `paginateAll` for lists).

---

## Contributing

PRs welcome. The codebase is structured so that adding a tool never causes
merge conflicts with other contributors — each category lives in its own
folder under `src/tools/`, registers itself in a category barrel, and the
top-level `src/tools/index.ts` simply spreads every category into
`allTools`. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the tool template,
code style rules, and PR checklist.

---

## License

MIT © stripe-mcp contributors. See [`LICENSE`](./LICENSE).

## Acknowledgements

- [Stripe](https://stripe.com/) — for the SDK and the platform this server wraps.
- [Model Context Protocol](https://modelcontextprotocol.io/) — for the protocol and TypeScript SDK.
- [zod](https://zod.dev) — for runtime input validation that makes this all type-safe.
