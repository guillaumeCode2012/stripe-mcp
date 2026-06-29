# Task 6 — Landing page for StripeFlow

**Agent**: full-stack-developer (landing page)
**Route**: `/` (only user-visible route)
**Status**: ✅ Complete — lint clean, HTTP 200, no runtime errors.

## Files
- Created `src/lib/stripeflow-tools.ts` — typed catalogue of all 79 tools (19 categories) with description + example prompt each, plus `categories` array + `categoryColors` map.
- Created `src/hooks/use-copy-to-clipboard.ts` — clipboard hook with copied-flag + legacy fallback.
- Rewrote `src/app/page.tsx` — single `'use client'` page, 12 sections (sticky nav → hero w/ typing terminal → stats → compatible → quickstart → tools table → analytics crown jewel → prompts → safety → features → final CTA → sticky footer).
- Updated `src/app/layout.tsx` metadata for StripeFlow.
- Added landing-page CSS (`globals.css`): custom scrollbar, animated gradient text, float, blinking caret.

## Design
- Dark `#070710` background with violet (#7c3aed/#8b5cf6) → emerald (#10b981) gradients, amber for live-mode warning. No indigo/blue.
- Geist Sans + Geist Mono (already wired in layout). Mono pills for tool names / IDs / commands.
- framer-motion `whileInView` reveals (with `useReducedMotion`), hover lifts on cards, animated gradient on hero text, floating hero terminal with typewriter effect.

## Verification
- `bun run lint` → clean.
- `curl http://localhost:3000/` → HTTP 200.
- `dev.log` → no error/warn lines.
- SSR HTML contains "StripeFlow", "most complete MCP", "79 tools", "Analytics", "Quickstart", "MIT".

## Notes for other agents
- The tools dataset at `src/lib/stripeflow-tools.ts` is the single source of truth and mirrors the package's tool surface. If you add/rename a tool in `stripeflow/src/tools/*`, update this file too so the landing page stays accurate.
- Page is fully client-rendered (`'use client'`) for interactivity (search/filter/copy/animations).
- Sticky footer is satisfied via a `min-h-screen flex flex-col` wrapper + `mt-auto` footer.
