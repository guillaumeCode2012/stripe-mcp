import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size (1-100).'),
  active: z
    .boolean()
    .optional()
    .describe('Filter to only active (true) or archived (false) tax rates.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: ID of the last tax rate from the previous page.'),
  max_items: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe('Cap on total tax rates returned.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_tax_list_rates',
    description:
      'List tax rates with an optional active filter. Auto-paginates up to max_items (default 100). Returns { total_count, has_more, data }.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size.' },
        active: { type: 'boolean', description: 'Filter by active flag.' },
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
      const filters = buildStripeParams<Stripe.TaxRateListParams>({
        active: parsed.data.active,
      });
      const all = await paginateAll<Stripe.TaxRate>(
        (p) => stripe.taxRates.list({ ...p, ...filters }),
        { maxItems: parsed.data.max_items ?? 100 },
      );
      return JSON.stringify(listEnvelope(all, false), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
