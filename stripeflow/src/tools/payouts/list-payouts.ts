import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size (1-100). Ignored if max_items is used.'),
  status: z
    .enum(['paid', 'pending', 'in_transit', 'canceled', 'failed'])
    .optional()
    .describe('Filter payouts by status.'),
  arrival_date: z
    .number()
    .int()
    .optional()
    .describe('Unix timestamp (seconds) — only return payouts expected to arrive on this date.'),
  destination: z
    .string()
    .optional()
    .describe('External account ID — only return payouts sent to this account.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: ID of the last payout from the previous page.'),
  max_items: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe('Cap on total payouts returned (auto-paginates up to this count).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payouts_list',
    description:
      'List payouts with optional filters (status, destination, arrival_date). Auto-paginates up to max_items (default 100). Returns { total_count, has_more, data }.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Page size.' },
        status: {
          type: 'string',
          enum: ['paid', 'pending', 'in_transit', 'canceled', 'failed'],
          description: 'Filter by status.',
        },
        arrival_date: { type: 'integer', description: 'Unix timestamp (seconds).' },
        destination: { type: 'string', description: 'External account ID.' },
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
      const filters = buildStripeParams<Stripe.PayoutListParams>({
        status: parsed.data.status,
        arrival_date: parsed.data.arrival_date,
        destination: parsed.data.destination,
      });
      const all = await paginateAll<Stripe.Payout>(
        (p) => stripe.payouts.list({ ...p, ...filters }),
        { maxItems: parsed.data.max_items ?? 100 },
      );
      return JSON.stringify(listEnvelope(all, false), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
