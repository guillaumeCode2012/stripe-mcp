import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size (1-100).'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: ID of the last meter from the previous page.'),
  max_items: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe('Cap on total meters returned.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_meters_list',
    description:
      'List billing meters. Auto-paginates up to max_items (default 100). Returns { total_count, has_more, data }.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size.' },
        starting_after: { type: 'string', description: 'Pagination cursor.' },
        max_items: { type: 'integer', minimum: 1, maximum: 1000, description: 'Total cap.' },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const all = await paginateAll<Stripe.Billing.Meter>(
        (p) => stripe.billing.meters.list(p),
        { maxItems: parsed.data.max_items ?? 100 },
      );
      return JSON.stringify(listEnvelope(all, false), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
