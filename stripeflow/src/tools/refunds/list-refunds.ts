import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size per request (max 100, default 100)'),
  payment_intent: z.string().optional().describe('Only return refunds for this PaymentIntent ID'),
  charge: z.string().optional().describe('Only return refunds for this charge ID'),
  starting_after: z.string().optional().describe('Cursor: ID of the object to start after'),
  max_items: z.number().int().min(1).optional().describe('Hard cap on total items to fetch across all pages'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_refunds_list',
    description: `List refunds, with optional filtering and auto-pagination.

Use this when:
- You want to review recent refunds
- You need to find refunds for a specific charge or PaymentIntent

Returns: \`{ total_count, has_more, data }\` envelope of Stripe Refund objects.
Stripe docs: https://stripe.com/docs/api/refunds/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Page size per request (max 100, default 100)' },
        payment_intent: { type: 'string', description: 'Only return refunds for this PaymentIntent ID' },
        charge: { type: 'string', description: 'Only return refunds for this charge ID' },
        starting_after: { type: 'string', description: 'Cursor: ID of the object to start after' },
        max_items: { type: 'integer', description: 'Hard cap on total items to fetch across all pages' },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const listParams = buildStripeParams<Stripe.RefundListParams>({
        payment_intent: parsed.data.payment_intent,
        charge: parsed.data.charge,
        limit: parsed.data.limit,
        starting_after: parsed.data.starting_after,
      });
      const data = await paginateAll<Stripe.Refund>(
        (p) => stripe.refunds.list({ ...listParams, ...p }),
        parsed.data.max_items !== undefined ? { maxItems: parsed.data.max_items } : undefined,
      );
      return JSON.stringify(listEnvelope<Stripe.Refund>(data), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
