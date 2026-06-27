# stripe-mcp — CLAUDE.md

## Project
The most complete MCP server for Stripe. Open source. Built for GitHub virality and acquisition.

## Stack
- Node.js 20+, TypeScript 5 strict mode, ESM only
- @modelcontextprotocol/sdk (latest)
- stripe (latest official SDK)
- zod (all inputs validated at runtime)
- vitest (tests), tsup (build), eslint + prettier

## Commands
- npm run build       → tsup build to dist/
- npm run typecheck   → tsc --noEmit
- npm run lint        → eslint src
- npm test            → vitest run
- npm run dev         → tsx watch src/index.ts

## Rules — NEVER VIOLATE
- NEVER use `any` type. Use `unknown` and narrow it.
- NEVER skip zod validation on tool inputs.
- NEVER make real Stripe API calls in tests — mock everything with vi.mock().
- NEVER throw unhandled exceptions in tools — always return a string error.
- ALWAYS paginate. Never assume one page of Stripe results is complete.
- ALWAYS format monetary values as both cents (raw) and readable string ("$12.50").
- ALWAYS include both Unix timestamp and ISO 8601 in date fields.

## Quality gates (must pass before finishing)
1. npm run typecheck → zero errors
2. npm run lint      → zero warnings
3. npm run build     → dist/index.js exists
4. npm test          → all pass
5. node dist/index.js → starts without error
