import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Page size (1-100). Note: results are auto-paginated up to max_items.'),
  email: z
    .string()
    .optional()
    .describe('Optional exact case-sensitive filter on the customer email field'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: a customer ID to start after (used for manual pagination)'),
  max_items: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Cap on total returned items (default 1000). Use to bound large accounts.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_list',
    description: `List Stripe customers with auto-pagination.

Use this when:
- You need to enumerate all or many customers (e.g. for a dashboard, sync, or report)
- You want to filter by an exact email match

This tool auto-paginates through every page up to \`max_items\` (default 1000). The response is wrapped as \`{ total_count, has_more, data }\` where \`has_more\` is true only if the cap was hit before exhausting all results.

Returns: an object with \`total_count\`, \`has_more\`, and \`data\` (array of Customer objects).
Stripe docs: https://stripe.com/docs/api/customers/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Page size (1-100). Note: results are auto-paginated up to max_items.',
        },
        email: {
          type: 'string',
          description: 'Optional exact case-sensitive filter on the customer email field',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: a customer ID to start after (used for manual pagination)',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Cap on total returned items (default 1000). Use to bound large accounts.',
        },
      },
      required: [],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const maxItems = parsed.data.max_items ?? 1000;
      const all = await paginateAll<Stripe.Customer>(
        (p) =>
          stripe.customers.list({
            ...p,
            ...(parsed.data.email ? { email: parsed.data.email } : {}),
          }),
        { maxItems },
      );
      const hasMore = all.length >= maxItems;
      return JSON.stringify(
        { total_count: all.length, has_more: hasMore, data: all },
        null,
        2,
      );
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
