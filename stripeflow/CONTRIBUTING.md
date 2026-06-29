# Contributing to StripeFlow

Thanks for your interest in making StripeFlow better. This guide is short and
practical — read it once and you should be able to ship a PR.

## Dev environment

Requirements:

- **Node.js 20+** (CI matrix runs on 20.x and 22.x)
- **npm 10+**

Setup:

```bash
git clone https://github.com/guillaumeCode2012/stripeflow.git
cd StripeFlow
npm install
```

You do **not** need a real Stripe secret key for most development. All tests
mock the Stripe client via `vi.mock()`, and tools only contact Stripe when
`execute()` is called with a live key.

For local end-to-end smoke testing against a Stripe test account:

```bash
export STRIPE_SECRET_KEY=sk_test_...
npm run dev
```

## Development workflow

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | `tsx watch src/index.ts` — hot-reload the MCP server     |
| `npm run typecheck` | `tsc --noEmit` — strict TypeScript check                 |
| `npm run lint`      | `eslint src` — ESLint with typescript-eslint recommended |
| `npm run build`     | `tsup` build to `dist/` with the CLI shebang banner      |
| `npm test`          | `vitest run` — mocked test suite                         |
| `npm run test:watch`| `vitest` watch mode                                       |
| `npm run format`    | `prettier --write src`                                    |

The full quality gate before a PR:

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

## Project structure

```
stripeflow/
├── src/
│   ├── index.ts              # Entry point — boots StdioServerTransport
│   ├── server.ts             # createServer(): wires allTools into an MCP Server
│   ├── config.ts             # getStripeClient() + stripeMode detection
│   ├── types/index.ts        # ToolDefinition + JSON-Schema helpers
│   ├── utils/
│   │   ├── object.ts         # buildStripeParams<P>() — see below
│   │   ├── pagination.ts     # paginateAll<T>(), listEnvelope<T>()
│   │   ├── currency.ts       # formatAmount(), normalizeToMonthly()
│   │   ├── date.ts           # nowUnix(), daysAgoUnix(), fromUnixTimestamp(), resolvePeriod()
│   │   └── format-stripe-error.ts  # formatStripeError()
│   └── tools/
│       ├── index.ts          # Top-level barrel — assembles allTools[]
│       └── <category>/       # One folder per category
│           ├── index.ts      # exports `tools: ToolDefinition[]`
│           ├── create-*.ts   # one file per tool
│           ├── get-*.ts
│           └── ...
├── tests/
│   ├── tools/                # one test file per category
│   └── utils/format.test.ts
├── docs/tools/               # one markdown file per category
├── DECISIONS.md              # architecture decision records
├── CLAUDE.md                 # agent-facing project rules
└── package.json
```

Each tool category is **self-contained**: a folder, a set of tool files, and an
`index.ts` barrel that exports a `tools: ToolDefinition[]` array. The
top-level `src/tools/index.ts` imports every category and concatenates them
into `allTools`. This means parallel contributors working on different
categories never cause merge conflicts — add a new category, then add a single
import line to the top-level barrel.

## Adding a new tool

### 1. Pick the category and name

Tool names follow the strict pattern `stripe_<category>_<action>`. Examples:
`stripe_customers_create`, `stripe_analytics_get_mrr`. File names are
`<action>-<resource>.ts` (kebab-case), e.g. `create-customer.ts`.

### 2. Copy the template

Every tool follows the same canonical template. Copy an existing tool in the
same category as a starting point — `src/tools/customers/create-customer.ts`
is a clean reference.

```ts
import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  // Every field MUST have a .describe() — it becomes the JSON-Schema
  // description that the LLM sees when deciding whether to call the tool.
  name: z.string().min(1).describe('Customer full name'),
  email: z.string().email().optional().describe('Customer email address'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_<category>_<action>',
    description: `One-line summary.

Use this when:
- reason 1
- reason 2

Returns: the Stripe Xxx object.
Stripe docs: https://stripe.com/docs/api/...`,
    inputSchema: {
      type: 'object',
      properties: {
        // Mirror the zod schema here by hand. Keep descriptions in sync.
        name: { type: 'string', description: 'Customer full name' },
        email: { type: 'string', description: 'Customer email address' },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['name'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.someResource.someAction(
        buildStripeParams<Stripe.SomeActionParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
```

### 3. Register the tool

Add the new tool to the category's `index.ts`:

```ts
import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createCustomer } from './create-customer.js';
import { toolDefinition as getCustomer } from './get-customer.js';
// add your new import here

export const tools: ToolDefinition[] = [
  createCustomer,
  getCustomer,
  // ...add your new tool here
];
```

If you're adding a brand-new category, also import the new barrel in
`src/tools/index.ts` and spread it into `allTools`.

### 4. Write a test

Add a test file under `tests/tools/<category>.test.ts`. Mock the Stripe client
with `vi.mock()`, never make real API calls.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    customers: { create: mockCreate },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as createCustomer } from '../../src/tools/customers/create-customer.js';

describe('stripe_customers_create', () => {
  beforeEach(() => mockCreate.mockReset());

  it('creates a customer and returns the Stripe object as JSON', async () => {
    mockCreate.mockResolvedValue({ id: 'cus_123', email: 'a@b.com' });
    const result = await createCustomer.execute({ email: 'a@b.com' });
    expect(JSON.parse(result)).toEqual({ id: 'cus_123', email: 'a@b.com' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ email: 'a@b.com' }));
  });

  it('returns a validation error for bad input', async () => {
    const result = await createCustomer.execute({ email: 'not-an-email' });
    expect(result).toContain('Validation error');
  });
});
```

### 5. Add docs

Add a section to `docs/tools/<category>.md` describing the new tool: name,
description, parameters table, return shape, and a Stripe docs link. Update
`README.md` if the tool count or category list changes.

## Why `buildStripeParams<P>`?

The project enables `exactOptionalPropertyTypes` in `tsconfig.json`, under
which an object literal `{ email: undefined }` is **not** assignable to a type
that declares `email?: string`. Zod's `.optional()` produces
`string | undefined`, so the parsed object can legitimately contain `undefined`
values for omitted optional fields.

`buildStripeParams<P>(obj)` walks the object, drops `undefined` keys, and
returns the result cast to `P` (a Stripe params type). This:

- keeps the codebase **cast-free** at tool call sites,
- preserves the runtime semantics Stripe already expects (it ignores
  `undefined` keys),
- and lets zod-validated input flow into typed Stripe SDK calls without
  fighting the compiler.

Use it on every Stripe SDK call that takes a params object. Don't bypass it
with `as Stripe.XxxParams`.

## Code style rules

These are non-negotiable. CI enforces most of them.

- **No `any`.** Use `unknown` and narrow it. `@typescript-eslint/no-explicit-any`
  is `error`.
- **Zod on every input.** Every tool must declare a zod `inputSchema`, call
  `safeParse`, and return `Validation error: ...` on failure.
- **Never throw from `execute`.** Tools return strings — `JSON.stringify(result)`
  on success, `formatStripeError(error)` on Stripe failure, `Validation error:`
  on input failure. The server treats tool throws as unexpected internal errors.
- **Paginate with `paginateAll<T>`.** Never assume one page of Stripe results
  is complete. Cap with `max_items` (default 1000) and wrap results with
  `listEnvelope<T>` → `{ total_count, has_more, data }`.
- **Format money with `formatAmount`.** Handles 0-decimal (JPY/KRW), 2-decimal
  (USD/EUR), and 3-decimal (BHD/JOD/KWD/OMR/TND) currencies. Never divide by
  100 manually.
- **Dual date formats.** Every timestamp field should expose both Unix seconds
  (e.g. `created`) and an ISO 8601 string (e.g. `created_iso`).
- **Mirrored JSON-Schema.** Keep the zod schema and the `inputSchema.properties`
  block in sync. The MCP client uses the JSON-Schema to render tool calls to
  the LLM.
- **`.describe()` everything.** Every zod field needs a `.describe()` — it
  becomes the LLM-facing description that determines whether your tool gets
  called.
- **Use `.js` extensions in relative imports.** This is ESM-only.
- **`z.record(z.string(), z.string())`** for metadata and string maps. Zod v4
  requires both key and value schemas — `z.record(z.string())` will not compile.

## Commit message convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Common types:

- `feat` — a new tool or feature (`feat(analytics): add stripe_analytics_get_mrr`)
- `fix` — a bug fix (`fix(refunds): pass amount as integer to Stripe`)
- `docs` — documentation only (`docs(readme): add Quickstart section`)
- `test` — test additions or fixes (`test(invoices): cover void-invoice error path`)
- `refactor` — code restructure with no behaviour change
- `chore` — tooling, deps, CI

Scopes match tool categories (`customers`, `subscriptions`, `analytics`,
`payouts`, etc.) or top-level concerns (`docs`, `ci`, `deps`).

## PR checklist

Before opening a PR, confirm every item:

- [ ] `npm run typecheck` → zero errors
- [ ] `npm run lint` → zero warnings
- [ ] `npm run build` → `dist/index.js` exists
- [ ] `npm test` → all tests pass
- [ ] If you added a tool: it's registered in the category `index.ts` and the
      top-level `allTools` array
- [ ] If you added a tool: there's a new test under `tests/tools/`
- [ ] If you added a tool: there's a section in `docs/tools/<category>.md`
- [ ] If the tool count changed: `README.md` is updated
- [ ] Commit messages follow Conventional Commits
- [ ] No real Stripe API calls in tests — everything is mocked

## Architecture background

For the why behind the patterns (ESM, stdio-only, zod-everywhere, mocked tests,
client-side analytics), read [`DECISIONS.md`](./DECISIONS.md). For the
hard project rules (no `any`, never throw, paginate, etc.), read
[`CLAUDE.md`](./CLAUDE.md).
