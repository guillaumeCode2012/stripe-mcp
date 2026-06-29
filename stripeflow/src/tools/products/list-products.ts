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
    .describe('Page size (1-100). Results are auto-paginated up to max_items.'),
  active: z
    .boolean()
    .optional()
    .describe('Filter: only return active (true) or inactive (false) products'),
  ids: z
    .array(z.string())
    .optional()
    .describe('Only return products with these IDs (cannot be used with starting_after)'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: a product ID to start after (manual pagination)'),
  max_items: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Cap on total returned items (default 1000).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_products_list',
    description: `List Stripe products with auto-pagination.

Use this when:
- You need to enumerate all or many products (e.g. for a catalogue or sync)
- You want to filter by active/inactive status or by a set of IDs

This tool auto-paginates through every page up to \`max_items\` (default 1000). The response is wrapped as \`{ total_count, has_more, data }\` where \`has_more\` is true only if the cap was hit before exhausting all results.

Returns: an object with \`total_count\`, \`has_more\`, and \`data\` (array of Product objects).
Stripe docs: https://stripe.com/docs/api/products/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Page size (1-100). Results are auto-paginated up to max_items.',
        },
        active: {
          type: 'boolean',
          description: 'Filter: only return active (true) or inactive (false) products',
        },
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Only return products with these IDs (cannot be used with starting_after)',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: a product ID to start after (manual pagination)',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Cap on total returned items (default 1000).',
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
      const all = await paginateAll<Stripe.Product>(
        (p) =>
          stripe.products.list({
            ...p,
            ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
            ...(parsed.data.ids ? { ids: parsed.data.ids } : {}),
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
