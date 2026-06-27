# stripe-mcp — Worklog

Project: The most complete open-source MCP server for Stripe, plus a viral landing page.

Environment: Next.js 16 app at `/home/z/my-project` (visible at `/`).
Package code: `/home/z/my-project/stripe-mcp/` (standalone TypeScript MCP server).

## Status
- Phase: 1 — Foundation (in progress)

## Goals
- Build complete stripe-mcp package (60+ tools, utils, config, server, tests, docs).
- Build stunning viral landing page at `/` showcasing the package.
- All quality gates pass.
- Set up 15-min webDevReview cron.

## Architecture decisions
- Package lives in `stripe-mcp/` subdir, fully independent of Next.js app.
- Each tool category self-contains its files; `src/tools/index.ts` pre-wires all imports (no merge conflicts for parallel agents).
- Landing page uses a static tools dataset (`src/lib/stripe-mcp-tools.ts`) generated from the package structure so the page renders instantly.
- Landing page aesthetic: dark developer-focused (Stripe/Linear/Vercel vibes), NOT indigo/blue — use a violet/emerald accent on near-black.

## Next steps
- Write foundation files (config, utils, types, server, barrel).
- Launch parallel tool-category subagents.
- Build landing page in parallel.

---
Task ID: 2-c
Agent: general-purpose (payment-intents/refunds/disputes/webhooks)
Task: Implement payment-intents (5), refunds (3), disputes (4), webhooks (5) tool categories.

Work Log:
- Read worklog, foundation (types, config, utils), and top-level tools/index.ts barrel to confirm imports and contract.
- Created src/tools/payment-intents/ with 5 tool files (create/get/confirm/cancel/list) + index.ts barrel exporting `tools`.
- Created src/tools/refunds/ with 3 tool files (create/get/list) + index.ts barrel.
- Created src/tools/disputes/ with 4 tool files (get/update/close/list) + index.ts barrel. close-dispute uses stripe.disputes.close(id).
- Created src/tools/webhooks/ with 5 tool files (create/get/update/delete/list) + index.ts barrel. All use stripe.webhookEndpoints resource; delete uses .del(id).
- Each tool follows the exact template: zod inputSchema mirrored into JSON-Schema inputSchema, buildStripeParams<P>(parsed.data) for SDK calls, formatStripeError on catch, never throws.
- List tools auto-paginate via paginateAll<T> with optional max_items cap and wrap results in listEnvelope<T> ({ total_count, has_more, data }).
- Used z.enum for fixed options (cancellation_reason, reason, status). Used z.record(z.string(), z.string()) for metadata and dispute evidence. Used z.array(z.string()) for webhook enabled_events.
- All relative imports use .js ESM extensions; imported Stripe via `import type Stripe from 'stripe'`.

Stage Summary:
- Files created: 21 total (17 tool files + 4 index.ts barrels across the 4 categories).
- Tool count: 17 tools (5 payment-intents + 3 refunds + 4 disputes + 5 webhooks), all named per spec (`stripe_<category>_<action>`).
- Verification: `npx tsc --noEmit` shows NO errors in any of my files (payment-intents, refunds, disputes, webhooks). Remaining tsc errors are confined to other categories' missing index.ts files and pre-existing foundation issues (src/config.ts LatestApiVersion, src/utils/format-stripe-error.ts Stripe.Error, src/tools/customers and payouts missing args) — none owned by this task.

---
Task ID: 6
Agent: full-stack-developer (landing page)
Task: Build stunning viral landing page at / for stripe-mcp.

Work Log:
- Read worklog + project layout; confirmed Next.js 16 app at /home/z/my-project with shadcn/ui, framer-motion, lucide-react, Geist fonts already wired.
- Created `src/lib/stripe-mcp-tools.ts` — typed catalogue of all 79 tools across 19 categories with description + realistic example prompt per tool, plus `categories` array and `categoryColors` map (violet/emerald/amber/rose palette, no indigo/blue).
- Created `src/hooks/use-copy-to-clipboard.ts` — small client hook with transient "copied" flag and legacy execCommand fallback for insecure contexts.
- Updated `src/app/layout.tsx` metadata (title, description, keywords, OG, Twitter) to reflect stripe-mcp.
- Added landing-page CSS extras to `src/app/globals.css`: `.smcp-scrollbar` custom scrollbar, `.smcp-gradient-text` animated gradient pan, `.smcp-float` float keyframes, `.smcp-caret` blinking caret for the typing animation.
- Wrote `src/app/page.tsx` as a single `'use client'` page with 12 sections in order: (1) sticky blurred-on-scroll nav with npm install copy pill + GitHub CTA; (2) hero with gradient headline, badges, dual CTAs, and a floating terminal card that types out a mock Claude MRR conversation with by-plan bar chart + top-customer callout; (3) stats strip (79 tools / 19 categories / 1-command / 0 servers); (4) "Works with" row (Claude Desktop, Cursor, Windsurf, Any MCP client) with checkmarks; (5) Quickstart 3 steps with copy buttons incl. full claude_desktop_config.json snippet; (6) searchable + category-filterable tools table with sticky header, custom scrollbar, max-h scroll, "Showing X of 79" count, mono tool pills, colored category chips, italic example prompts; (7) Analytics "crown jewel" spotlight with violet→emerald gradient glow border and 5 mini-dashboard cards (MRR big number + bar chart, Churn rate + downward sparkline SVG, Revenue Summary 3-up + sparkline, Top Customers ranked list, Failed Payments breakdown bars) plus a CTA card; (8) example-prompt chat-bubble grid (6 prompts); (9) Safety section — two columns read-only (emerald) vs mutating (amber) tool lists + a live-vs-test mode callout with mock startup banner; (10) features grid (ESM-first, Zod-validated, auto-pagination, typed errors, formatted money, dual dates, mocked tests, 1-command install); (11) final CTA gradient panel with install command + GitHub button; (12) footer with brand + Tools/Resources/Community nav columns, MIT badge, bottom row "MIT License · Built for GitHub virality" + ⚡, made sticky via `min-h-screen flex flex-col` wrapper + `mt-auto` footer.
- Used shadcn Button/Badge/Input/Tooltip, framer-motion `motion.div whileInView` for scroll reveals (with `useReducedMotion` guard), lucide-react icons throughout.
- Verified: `bun run lint` passes clean; `curl /` returns HTTP 200; dev.log shows no errors/warnings; SSR HTML contains "stripe-mcp", "most complete MCP", "79 tools", "Analytics", "Quickstart", "MIT".

Stage Summary:
- Files created: `src/lib/stripe-mcp-tools.ts` (79 tools + categories + color map), `src/hooks/use-copy-to-clipboard.ts`.
- Files modified: `src/app/page.tsx` (full landing page rewrite), `src/app/layout.tsx` (metadata), `src/app/globals.css` (scrollbar + animation keyframes).
- Lint: clean. Runtime: HTTP 200, no errors in dev.log. Responsive: mobile-first (nav collapses, hero stacks, table scrolls horizontally, grids 1→2→3/4 col). Accessibility: semantic header/nav/main/section/footer, aria-labels on icon buttons, keyboard-focusable controls. Sticky footer rule satisfied. Dark violet/emerald aesthetic on #070710 with radial glows + grid overlay — no indigo/blue.

---
Task ID: 2-a
Agent: general-purpose (customers/products/prices)
Task: Implement customers (6), products (5), prices (4) tool categories.

Work Log:
- Read existing foundation (config.ts, types/index.ts, utils/object.ts, pagination.ts, format-stripe-error.ts, currency.ts, date.ts, tools/index.ts barrel) and the Stripe SDK type defs for Customers / Products / Prices to verify exact method/param signatures.
- Created src/tools/customers/ with 6 tools + index.ts:
  - create-customer.ts (email, name, phone, description, metadata, nested address + shipping schemas)
  - get-customer.ts (customer_id required, expand for default_payment_method / subscriptions)
  - update-customer.ts (customer_id required, email/name/phone/description/metadata)
  - delete-customer.ts (customer_id required, returns DeletedCustomer)
  - list-customers.ts (auto-paginate via paginateAll, optional email filter, max_items cap, wrapped as {total_count, has_more, data})
  - search-customers.ts (Stripe search API with query + limit + page)
  - index.ts exporting `tools` array
- Created src/tools/products/ with 5 tools + index.ts:
  - create-product.ts (name required, description, images, default_price, metadata, active)
  - get-product.ts (product_id required, expand)
  - update-product.ts (product_id required, name/description/images/metadata/active/default_price)
  - archive-product.ts (product_id required; uses products.update(id, {active: false}))
  - list-products.ts (auto-paginate, optional active/ids filters, max_items cap)
  - index.ts exporting `tools` array
- Created src/tools/prices/ with 4 tools + index.ts:
  - create-price.ts (unit_amount + currency required, product OR product_data via zod .refine, optional recurring {interval, interval_count}, nickname, lookup_key, metadata, active)
  - get-price.ts (price_id required, expand)
  - update-price.ts (price_id required, nickname/lookup_key/metadata/active)
  - list-prices.ts (auto-paginate, optional active/product/type filters, max_items cap)
  - index.ts exporting `tools` array
- All tool files follow the exact template: zod input schema mirrored as JSON Schema in `inputSchema.properties` + `required`, `buildStripeParams<Stripe.XxxParams>(parsed.data)` for every Stripe SDK call, `formatStripeError` for all catch blocks, `JSON.stringify(result, null, 2)` output, no `any` type.
- First `npx tsc --noEmit` run flagged `z.record(z.string())` (Zod 4.4.3 requires `z.record(keyType, valueType)`). Fixed all 6 occurrences (create-customer, update-customer, create-product, update-product, create-price, update-price) by switching to `z.record(z.string(), z.string())`.
- Re-ran `npx tsc --noEmit`: zero errors in customers/products/prices files. Remaining errors are exclusively in other agents' files (analytics, invoices, payouts, subscriptions, tax) and in pre-existing foundation (config.ts `Stripe.LatestApiVersion`, format-stripe-error.ts `Stripe.Error`) — explicitly out of scope per task instructions.

Stage Summary:
- Files created: 18 total (15 tool files + 3 category index.ts) across src/tools/customers/, src/tools/products/, src/tools/prices/.
- Tool count: 15 (customers: 6, products: 5, prices: 4).
- All files pass `tsc --noEmit` clean (verified by grep filtering tsc output for `src/tools/(customers|products|prices)/` → "NO ERRORS IN CUSTOMERS/PRODUCTS/PRICES FILES").
- No issues / blockers. The three category `tools` arrays are ready to be spread into the top-level `allTools` barrel once other categories are in place.

---
Task ID: 2-b
Agent: general-purpose (subscriptions/invoices)
Task: Implement subscriptions (8) and invoices (6) tool categories.

Work Log:
- Read worklog + foundation files (types, config, utils: object/pagination/format-stripe-error/currency/date) to confirm conventions and the `buildStripeParams` + `paginateAll` patterns.
- Inspected Stripe SDK type declarations (`Subscriptions.d.ts`, `Invoices.d.ts`, `shared.d.ts`) to pin exact param interfaces, enums (ProrationBehavior, SubscriptionListParams.Status, PauseCollection.Behavior, InvoiceListParams.Status), and the `SubscriptionUpdateParams.PauseCollection.behavior` required-field quirk.
- Created `src/tools/subscriptions/` with 8 tool files: create, get, update, cancel, pause, resume, list, search — plus `index.ts` barrel exporting `tools`.
- Created `src/tools/invoices/` with 6 tool files: get, list, pay, void, finalize, send — plus `index.ts` barrel exporting `tools`.
- Every tool follows the canonical template: zod input schema (every field `.describe()`-d), mirrored JSON Schema in `definition.inputSchema`, `safeParse` validation, `buildStripeParams<P>` for Stripe SDK calls, `JSON.stringify(result, null, 2)` on success, `formatStripeError` on failure. List tools auto-paginate via `paginateAll` and return `{ total_count, has_more, data }`.
- Resolved three strict-mode issues surfaced by `tsc --noEmit`:
  1. `z.record(z.string())` → `z.record(z.string(), z.string())` (zod v4 requires key+value schemas) in create-subscription and update-subscription.
  2. `pause-subscription`: `SubscriptionUpdateParams.PauseCollection.behavior` is required by Stripe's type — defaulted to `'void'` (Stripe's documented default) when caller omits it.
  3. `list-invoices`: removed `'deleted'` from the status enum — Stripe's `InvoiceListParams.Status` only accepts `draft|open|paid|uncollectible|void`. Documented the valid set in the field description.
- For cancel-subscription, used Stripe's actual `cancellation_details` shape `{ comment, feedback }` (Stripe's cancel API does not accept `reason`; `reason` is a response-only field set internally by Stripe). Documented the mapping in the field description.
- For search-subscriptions, returned the first search page wrapped in the standard `{ total_count, has_more, data }` envelope; documented that Stripe search uses `next_page` pagination (intentionally not auto-paginated to keep search responsive).
- Verified: `npx tsc --noEmit` reports zero errors in `src/tools/subscriptions/**` and `src/tools/invoices/**`. Remaining tsc errors are in other categories' files (analytics/payouts/tax/config/format-stripe-error + missing barrels for checkout/billing-portal/balance) — outside this task's scope per instructions.

Stage Summary:
- Files created: 16 (8 subscription tools + 6 invoice tools + 2 category barrels).
- Tools registered: 14 (8 subscriptions + 6 invoices), all named `stripe_<category>_<action>` per spec.
- Top-level `src/tools/index.ts` already imports `subscriptions/index.js` and `invoices/index.js` — both now resolve and export `tools: ToolDefinition[]`.
- No errors in own files. No `any` used (all params typed via Stripe SDK types + zod inference, cast through `Record<string, unknown>` only inside `buildStripeParams`).

---
Task ID: 2-e
Agent: general-purpose (payouts/tax/meters/analytics)
Task: Implement payouts (4), tax (3), meters (3), analytics (5) tool categories.

Work Log:
- Read foundation files (config, types, utils) and inspected Stripe SDK type definitions for Payout, TaxRate, Billing.Meter, Charge, Subscription, Customer.
- Discovered the SDK only exposes `formula: 'sum'|'count'|'last'` and `customer_mapping.type: 'by_id'` on MeterCreateParams (spec mentioned 'max'|'min' and 'id'|'email' which are not supported by the actual API — honored the SDK to keep types strict). `default_aggregation` is required, not optional.
- Created payouts tools: create-payout, get-payout, cancel-payout, list-payouts. List tool auto-paginates and wraps with `listEnvelope`.
- Created tax tools: create-tax-rate (with active default true), get-tax-rate, list-tax-rates (filter by active).
- Created meters tools using `stripe.billing.meters.{create,retrieve,list}` typed surface.
- Created the five analytics crown-jewel tools:
  - get-mrr: paginates active (and optionally trialing) subscriptions with expanded customer + price, sums per-item MRR via `normalizeToMonthly`, returns total_mrr, formatted, by_plan, by_currency, top 10 customers.
  - get-churn-rate: single fetch of all subscriptions created before period_end, then computes active_at_period_start and churned_in_period client-side; includes per-customer LTV estimate and cancellation_details.reason.
  - get-revenue-summary: paginates charges in resolved period, computes gross/net/refund/failure stats, builds day or month buckets for time series.
  - get-top-customers: ranks customers by lifetime_value / mrr / payment_count; for LTV/count fetches charges (filtered client-side for succeeded), for MRR uses active subscriptions.
  - get-failed-payments-report: paginates charges in lookback window (filtered client-side for failed), builds decline-code breakdown, per-customer failure summary, and recovery_suggestion map.
- Fixed all TypeScript errors in my scope:
  - `z.record(z.string())` → `z.record(z.string(), z.string())` (Zod 4 requires key+value schemas).
  - Customer `name?` field is `string | null | undefined`; coerced with `?? null` to match declared interface shape.
  - `Stripe.ChargeListParams` does not expose a `status` filter in this SDK version, so filtered charges client-side (status === 'failed' / 'succeeded') after paginating by created range.

Stage Summary:
- Files created: 19 total (4 payouts + 3 tax + 3 meters + 5 analytics tools, plus 4 category index.ts files).
- Tool count added: 15 tools registered into `allTools` via the pre-wired barrel.
- `npx tsc --noEmit`: ZERO errors in payouts/tax/meters/analytics files. The only remaining project-level errors are in foundation files (`src/config.ts`, `src/utils/format-stripe-error.ts`) and belong to other agents — not in my scope.
- No `any` used anywhere; all Stripe SDK calls go through `buildStripeParams<P>` or direct typed params; all analytics use `paginateAll<T>` with explicit generics.

---
Task ID: 2-d
Agent: general-purpose (coupons/promotion-codes/payment-links/checkout/billing-portal/balance)
Task: Implement coupons (4), promotion-codes (3), payment-links (4), checkout (4), billing-portal (1), balance (2) tool categories.

Work Log:
- Read foundation files (types, config, utils for object/pagination/format-stripe-error/currency/date) and the top-level tools/index.ts barrel to confirm import contracts.
- Inspected installed Stripe SDK type definitions (Coupons.d.ts, PromotionCodes.d.ts, PaymentLinks.d.ts, Checkout/Sessions.d.ts, BillingPortal/Sessions.d.ts, Balance.d.ts, BalanceTransactions.d.ts) to verify the exact param-type shapes (e.g. PromotionCodeCreateParams wraps the coupon id inside `promotion: { coupon, type: 'coupon' }`, Checkout types live under `Stripe.Checkout.*`, BillingPortal under `Stripe.BillingPortal.*`).
- Created 24 files across 6 new directories under src/tools/: coupons (create, get, delete, list), promotion-codes (create, get, list), payment-links (create, get, update, list), checkout (create, get, expire, list), billing-portal (create), balance (get, list-transactions), plus an index.ts barrel for each category that exports a `tools` array.
- Every tool follows the required template: zod inputSchema with .describe() on every field, mirrored JSON Schema in inputSchema.properties, z.enum for fixed options, ToolDefinition export with name `stripe_<category>_<action>`, execute() that safeParses, calls Stripe via buildStripeParams<Stripe.*Params>, JSON.stringify(result, null, 2) on success, formatStripeError on failure — never throws.
- LIST tools auto-paginate with paginateAll, wrap output as { total_count, has_more, data } via listEnvelope. Honored caller-provided starting_after as the initial cursor by injecting it into the first fetchPage call inside a small closure, and used max_items ?? limit as the paginateAll maxItems cap.
- Handled the promotion-code shape mismatch by destructuring `coupon` out of parsed.data and constructing `promotion: { coupon, type: 'coupon' as const }` before buildStripeParams.
- Used z.record(z.string(), z.unknown()) for loosely-typed nested objects (subscription_data, payment_intent_data, billing-portal flow_data) to stay flexible while keeping strict mode + exactOptionalPropertyTypes happy.
- Ran `npx tsc --noEmit`; filtered output for my six categories — zero errors in my files. Only two pre-existing errors remain, both in foundation files outside my scope (src/config.ts: Stripe.LatestApiVersion not exported by installed SDK; src/utils/format-stripe-error.ts: Stripe.Error should be Stripe.errors).

Stage Summary:
- Files created: 24 (18 tool files + 6 index.ts barrels).
- Tool count: 18 (coupons 4, promotion-codes 3, payment-links 4, checkout 4, billing-portal 1, balance 2).
- All tool names match the required `stripe_<category>_<action>` convention.
- npx tsc --noEmit shows no errors in any of my files; only pre-existing foundation-file errors remain (out of scope per task instructions).
- No issues or blockers; ready for the master barrel to assemble the full catalogue once all parallel categories finish.

---
Task ID: 5
Agent: general-purpose (docs + CI)
Task: Write README, CONTRIBUTING, CHANGELOG, LICENSE, docs/tools/*.md, .github workflows.

Work Log:
- Read worklog + every relevant source file (config.ts, server.ts, index.ts, types/index.ts, all 5 utils, all 79 tool files, tsconfig, eslint, tsup, vitest configs, CLAUDE.md, DECISIONS.md) to ground every doc claim in the actual code rather than the spec.
- Confirmed package facts: 79 tools across 19 categories, ESM-only, tsup build with #!/usr/bin/env node banner, TypeScript strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess, vi.mock() tests, stdio transport, buildStripeParams<P> helper, paginateAll<T> + listEnvelope<T>, formatAmount/normalizeToMonthly/formatStripeError utils, stripeMode detection on key prefix, no apiVersion pinning (DECISIONS 008).
- Wrote LICENSE — MIT, copyright holder "stripe-mcp contributors", year 2025.
- Wrote .github/workflows/ci.yml — Node 20.x + 22.x matrix, runs typecheck/lint/build/test, npm cache, fail-fast: false.
- Wrote .github/workflows/release.yml — triggers on v* tags, publishes to npm with NPM_TOKEN, pins Node 20.x, includes id-token: write for provenance.
- Wrote CHANGELOG.md — Keep-a-Changelog format, [1.0.0] initial release listing all 79 tools by category, the analytics crown jewel, platform features (zod, pagination, dual dates, money formatting, formatStripeError, stdio, buildStripeParams, tool registry), tests & CI, docs, and known limitations.
- Wrote CONTRIBUTING.md — dev env (Node 20+), full npm script table, project structure tree, the canonical tool template (zod + safeParse + buildStripeParams + formatStripeError + paginateAll), 5-step "add a new tool" flow, explanation of why buildStripeParams<P> exists (exactOptionalPropertyTypes), code style rules (no any, zod on every input, never throw, paginateAll, formatAmount, dual dates), Conventional Commits, and a PR checklist. Links to DECISIONS.md and CLAUDE.md.
- Wrote 19 docs/tools/*.md files (analytics, balance, billing-portal, checkout, coupons, customers, disputes, invoices, meters, payment-intents, payment-links, payouts, prices, products, promotion-codes, refunds, subscriptions, tax, webhooks) — each with a category intro paragraph and per-tool sections (description, parameters table with type/required/description columns, returns shape, Stripe docs link). For analytics.md, included real example JSON output shapes for all 5 tools (MRR breakdown, churned_customers array, revenue time_series, top_customers ranked list, failed_payments decline-code breakdown + recovery-suggestion mapping) so the docs sell the feature.
- Wrote README.md — viral-optimized: ASCII ⚡ + stripe-mcp banner, six shields.io badges (npm/MIT/MCP/TypeScript/CI/stars), one-line pitch, "Why this exists" (3 bullets anchored on analytics/1-command/typed-end-to-end), 3-step Quick Start with exact claude_desktop_config.json + Cursor + Windsurf snippets, "Compatible with" row, full 79-tool table grouped by 19 categories (each row: tool | what it does | realistic example prompt), Analytics spotlight section with sample return shapes and a sample "Show me my MRR and which plan is growing fastest" conversation, 8 curated example prompts, Safety section (sk_test_ vs sk_live_ detection, read-only vs destructive tool categorization), Architecture section linking to DECISIONS.md, Development section linking to CONTRIBUTING.md, Contributing paragraph, MIT license, Acknowledgements (Stripe SDK, MCP SDK, zod).
- Verified: all 19 docs/tools/*.md files exist, 79 tool sections across them, 79 tool rows in README, code fences balanced in README/CONTRIBUTING/all 19 docs, both YAML workflows parse cleanly with PyYAML, no source .ts files or package.json modified (only docs/CI/LICENSE written).

Stage Summary:
- Files created (25 total): README.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE, .github/workflows/ci.yml, .github/workflows/release.yml, and 19 × docs/tools/<category>.md (analytics, balance, billing-portal, checkout, coupons, customers, disputes, invoices, meters, payment-intents, payment-links, payouts, prices, products, promotion-codes, refunds, subscriptions, tax, webhooks).
- No source code, package.json, or Next.js landing page touched.
- Tool counts verified against src/tools: 6 customers + 5 products + 4 prices + 8 subscriptions + 6 invoices + 5 payment-intents + 3 refunds + 4 disputes + 5 webhooks + 4 coupons + 3 promotion-codes + 4 payment-links + 4 checkout + 1 billing-portal + 2 balance + 4 payouts + 3 tax + 3 meters + 5 analytics = 79. README table rows match. docs/tools section count matches.
- Accuracy: every parameter table, every Stripe docs URL, every tool description, and every return-shape example was cross-checked against the actual .ts source file rather than the spec — including the promotion-code coupon-wrapping quirk, the subscriptions.pause default-void behavior, the search-subscriptions "first page only" note, the meter formula enum (sum/count/last only, not the spec's max/min/id/email which Stripe doesn't support), and the failed-payments recovery-suggestion mapping.
- Ready for: npm publish on v1.0.0 tag, GitHub repo creation with stars badge URL pointing at stripe-mcp/stripe-mcp.

---
Task ID: FINAL
Agent: orchestrator (Z.ai Code)
Task: Finalize stripe-mcp package + landing page; run all quality gates; verify via agent-browser.

Work Log:
- Built stripe-mcp foundation (types, utils: currency/date/pagination/format-stripe-error/object, config, server, index, pre-wired barrel).
- Launched 6 parallel subagents: 5 tool-category agents (79 tools across 19 categories) + 1 landing-page agent.
- Fixed 2 foundation type issues: `Stripe.LatestApiVersion` (not exported) → omit apiVersion (use SDK default, DECISIONS 008); `Stripe.Error` → `Stripe.errors.StripeError`.
- Fixed 7 unused-import lint warnings across tool files.
- Migrated ESLint 10 (incompatible) → ESLint 9 flat config + typescript-eslint 8.
- Wrote 5 test files (36 tests). Resolved a vitest vi.fn mock-throw detection quirk by using a swappable plain-function holder for the error-path test (DECISIONS 009). Pinned vitest@^3.
- Fixed double-shebang in dist (removed source shebang; tsup banner handles it).
- Wrote 25 docs/CI files via subagent: README (viral, 79-tool table), CONTRIBUTING, CHANGELOG, LICENSE, 19 docs/tools/*.md, 2 GitHub workflows.
- Verified landing page via agent-browser: title correct, no console errors, all 12 sections render, search filter works, footer sticky-on-long-content, mobile responsive (nav collapses).
- VLM-verified visual design: dark theme, violet+emerald accents (no blue/indigo), hero/quickstart/tools-table/analytics all render correctly on scroll.

Stage Summary:
- stripe-mcp package: ALL 5 QUALITY GATES PASS.
  1. typecheck → 0 errors
  2. lint → 0 warnings
  3. build → dist/index.js (217KB)
  4. test → 36/36 pass
  5. node dist/index.js → "✓ Test mode" + "stripe-mcp running on stdio"
- 79 tools across 19 categories (customers, products, prices, subscriptions, invoices, payment-intents, refunds, disputes, webhooks, coupons, promotion-codes, payment-links, checkout, billing-portal, balance, payouts, tax, meters, analytics).
- 5 analytics tools (crown jewel): get_mrr, get_churn_rate, get_revenue_summary, get_top_customers, get_failed_payments_report — all compute client-side via paginateAll.
- Next.js landing page at / : lint clean, renders, interactive, responsive, visually polished.
- Next steps for cron-driven review: enhance landing page micro-interactions, add an interactive "try a prompt" demo, expand test coverage to more tool categories, add a Dockerfile, add Cursor/Windsurf config docs.
