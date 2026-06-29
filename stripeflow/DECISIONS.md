# Architecture Decisions

## 001 — ESM over CommonJS
ESM-first. MCP SDK and Stripe SDK are ESM-native. No interop complexity.

## 002 — Zod runtime validation on all inputs
MCP tool inputs arrive as untyped JSON from the LLM. Zod catches bad inputs before they hit Stripe and returns actionable error messages instead of cryptic Stripe errors.

## 003 — stdio transport only, no HTTP server
Universal MCP standard for local tools. No port conflicts, no auth, works with all clients.

## 004 — Mocked tests, no real Stripe calls
Tests run in CI without secrets. vi.mock() on the Stripe client covers all scenarios.

## 005 — Tool registry pattern with pre-wired barrel
Each category exports a `tools` array of `{ definition, execute }` objects. The top-level `src/tools/index.ts` imports every category and concatenates. Because all category names are known upfront, the barrel is written once — parallel tool implementation never causes merge conflicts.

## 006 — Shared ToolDefinition type
`src/types/index.ts` defines `ToolDefinition = { definition: Tool; execute: (input: unknown) => Promise<string> }`. Every tool file exports this shape so the server can treat them uniformly.

## 007 — Analytics tools compute client-side
MRR, churn, revenue summaries are computed by paginating Stripe resources and aggregating locally. Stripe has no single "MRR" endpoint, so this is the canonical approach (matches Baremetrics/ChartMogul methodology).
