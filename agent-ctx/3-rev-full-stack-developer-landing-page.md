# Task 3-rev — Landing page round 2 (Compare + Changelog + polish)

**Agent**: full-stack-developer (landing page round 2)
**Route**: `/` (single landing page at `src/app/page.tsx`)
**Status**: ✅ Complete — lint clean, HTTP 200, no runtime errors.

## Files modified
- `src/app/page.tsx` — extended from 2527 → 3025 lines (added 2 new sections, 4 premium-polish features).

No other files touched. The `stripe-mcp/` package was left untouched, as required.

## What changed

### A. QA fixes from round 1
1. **Hero stat highlight** — the hero subhead's "79 tools / 19 categories / 1 command" mentions are now `text-lg md:text-xl font-extrabold` with the violet→emerald gradient (`bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent`), so they pop against the body text instead of blending in.
2. **Hero badge alignment** — added `items-center` to the badge flex container for consistent vertical alignment when badges wrap on mobile.
3. **FAQ chevrons brighter** — added `[&>svg]:text-violet-300 [&>svg]:size-5 [&>svg]:shrink-0 hover:[&>svg]:text-violet-200` to the `AccordionTrigger` className. The default `size-4 text-muted-foreground` chevron is now a larger, brighter violet that rotates on open (Radix's existing `[&[data-state=open]>svg]:rotate-180` rule still applies).
4. **HowItWorks connectors** — replaced the plain arrow circle with a gradient bar (`bg-gradient-to-r from-violet-500/60 via-fuchsia-400/50 to-emerald-500/60`) sitting behind the arrow circle. Desktop shows a horizontal bar; mobile shows a vertical bar. The grid template changed from `1fr_auto_1fr_auto_1fr_auto_1fr` to `1fr_4rem_1fr_4rem_1fr_4rem_1fr` so the bars have visible width.
5. **Playground polish** — added:
   - **Copy response** button (top-right of the response card header, with `CheckCheck` success state) that copies a `stripe-mcp · {tool}\nPrompt: "{prompt}"\nLatency: {ms}ms (simulated)` summary.
   - **Prompt history** row above the prompt grid: `← prev / next →` arrow buttons + a row of 6 dots (active = wide gradient pill, viewed = violet dot, unviewed = dim dot) + `1 / 6` counter. Tracked via a `viewedIds: Set<number>` state that grows as the user clicks prompts.

### B. New sections (mandatory)
6. **Compare** (`<Section id="compare">`) — "Why stripe-mcp?" with subhead "The only Stripe MCP with real analytics. Built for production."
   - 3-column table: Feature | stripe-mcp | Other Stripe MCPs.
   - stripe-mcp column has a violet→emerald gradient header background and per-cell gradient tint to draw the eye.
   - 10 rows: Total tools (79 vs 5–15), Analytics (✓ 5 tools vs ✗), Auto-pagination (✓ vs ✗ manual), Zod validation (✓ vs ✗ raw JSON), Typed errors with doc links (✓ vs ✗), Multi-currency (✓ zero + 3-decimal vs ✗ cents only), Dual date formats (✓ vs ✗), CLI flags (✓ vs ✗), Test coverage (44 tests vs 0–5), License (MIT vs MIT).
   - emerald `Check`, rose `X`, amber `Minus` icons via a `CompareCellView` component.
   - Below the table: a callout "Built solo, open source, MIT. Star it if it saves you time. ⭐" with a gradient GitHub button.
   - Horizontally scrollable on mobile (`overflow-x-auto smcp-scrollbar`, `min-w-[640px]` table).
7. **Changelog** (`<Section id="changelog">`) — "What's new" compact vertical timeline.
   - 4 entries: v1.0.0 (emerald dot, "latest" pill), v0.9.0 (violet dot), v0.5.0 (zinc dot), v1.1 (dashed zinc dot, future).
   - Each entry: version pill (mono) + date + one-line description.
   - Vertical connector line (`bg-gradient-to-b from-white/15 to-white/5`) between entries.
   - Compact `py-16 md:py-20` so it doesn't dominate the page.

### C. Premium polish (mandatory)
8. **ReadingProgressBar** — a 2px gradient (`from-violet-500 via-fuchsia-400 to-emerald-400`) bar fixed to the very top of the viewport (`fixed inset-x-0 top-0 z-[60] h-0.5 pointer-events-none`). Width is driven by a scroll listener throttled with `requestAnimationFrame`. Sits above the nav (nav is `z-50`, bar is `z-60`). Doesn't block clicks.
9. **Animated count-up stats** — the stats strip now animates 0 → value when scrolled into view. Built on a small `useCountUp` hook (rAF + easeOutCubic, 1500ms) gated by `useInView(ref, { once: true, margin: "-60px" })`. `tabular-nums` prevents digit-width jitter during the animation. Non-numeric value ("1-Command") is shown directly. Reduced-motion users see the final value immediately (no count, no stuck "0").

### D. Nav update
- Added "Compare" as the first nav link (it's the strongest value-prop for first-time visitors).
- Dropped "Roadmap" from the nav (still on the page, just not in the nav) to keep the link row clean — 7 items total: Compare, How it works, Playground, Tools, Analytics, FAQ, GitHub.

### E. Section order (final)
Hero → Stats strip (count-up) → Compatible with → **Compare (NEW)** → How it works (gradient connectors) → Quickstart → Playground (copy + history) → Tools table → Analytics spotlight → Example prompts → Safety → Features → FAQ (brighter chevrons) → **Changelog (NEW)** → Roadmap → Final CTA → Footer.

Plus a fixed `ReadingProgressBar` at the very top of the viewport.

## Quality gates
- `bun run lint` → clean (no errors, no warnings).
- `curl http://localhost:3000/` → HTTP 200.
- `tail dev.log` → only `✓ Compiled` + `GET / 200` lines; no runtime errors (the only warning is the pre-existing Next.js `allowedDevOrigins` cross-origin note, which is environmental, not from this code).
- Verified in rendered HTML: `id="compare"`, `id="changelog"`, "Why stripe-mcp?", "Other Stripe MCPs", "Built solo, open source", "What's new", "Initial release", "Added analytics crown jewel", `aria-label="Previous prompt"`, `aria-label="Next prompt"`, `aria-label="Copy response"`, the FAQ trigger's `[&>svg]:text-violet-300 [&>svg]:size-5` classes, the Compare header `from-violet-500/20 to-emerald-500/20`, the `pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5` ReadingProgressBar, and `tabular-nums` on the count-up tiles.

## Notes for other agents
- The `useCountUp` + `useInView` pattern (gated by `useReducedMotion`) is the recommended way to add scroll-triggered numeric animations on this page — copy it if you need more.
- The `ReadingProgressBar` is a sibling of `<Nav />` inside the `TooltipProvider`, both fixed; the bar is `z-[60]` so it overlays the top 2px of the `z-50` nav (standard Vercel/Stripe docs look).
- The Compare table's "Other Stripe MCPs" column intentionally uses generic names (no specific competitor named) — keep it that way for fairness.
- The Changelog is compact by design (`py-16 md:py-20`); don't expand it without reason.
- `viewedIds: Set<number>` in the Playground tracks viewed prompts so the history dots can show a "viewed but not active" state — extend it if you add more prompts.
