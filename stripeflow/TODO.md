# TODO — StripeFlow build

## Phase 1 — Scaffolding
- [x] CLAUDE.md
- [x] package.json
- [x] tsconfig.json + tsup.config.ts
- [x] .eslintrc.json + .prettierrc + .gitignore
- [x] src/types/index.ts
- [x] src/utils/ (4 files)
- [x] src/config.ts

## Phase 2 — Tools (60+)
- [ ] customers (6 tools)
- [ ] products (5 tools)
- [ ] prices (4 tools)
- [ ] subscriptions (8 tools)
- [ ] invoices (6 tools)
- [ ] payment-intents (5 tools)
- [ ] refunds (3 tools)
- [ ] disputes (4 tools)
- [ ] webhooks (5 tools)
- [ ] coupons (4 tools)
- [ ] promotion-codes (3 tools)
- [ ] payment-links (4 tools)
- [ ] checkout (4 tools)
- [ ] billing-portal (1 tool)
- [ ] balance (2 tools)
- [ ] payouts (4 tools)
- [ ] tax (3 tools)
- [ ] meters (3 tools)
- [ ] analytics (5 tools) ← CROWN JEWEL

## Phase 3 — Server + Entry point
- [x] src/tools/index.ts (barrel export)
- [x] src/server.ts
- [x] src/index.ts

## Phase 4 — Tests
- [ ] tests/tools/customers.test.ts
- [ ] tests/tools/subscriptions.test.ts
- [ ] tests/tools/invoices.test.ts
- [ ] tests/tools/analytics.test.ts
- [ ] tests/utils/format.test.ts

## Phase 5 — Docs + CI
- [ ] README.md (viral-optimized)
- [ ] CONTRIBUTING.md
- [ ] DECISIONS.md
- [ ] CHANGELOG.md
- [ ] .github/workflows/ci.yml
- [ ] .github/workflows/release.yml
- [ ] docs/tools/*.md (one per category)

## Phase 6 — Quality gates
- [ ] typecheck passes
- [ ] lint passes
- [ ] build passes
- [ ] tests pass
- [ ] server starts

## Phase 7 — Landing page (Next.js)
- [ ] Stunning landing page at / showcasing StripeFlow
