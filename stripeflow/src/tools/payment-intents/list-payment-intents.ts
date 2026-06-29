import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size per request (max 100, default 100)'),
  customer: z.string().optional().describe('Only return PaymentIntents for this customer ID'),
  status: z
    .enum([
      'requires_payment_method',
      'requires_confirmation',
      'succeeded',
      'canceled',
      'processing',
      'requires_action',
    ])
    .optional()
    .describe('Only return PaymentIntents with this status'),
  starting_after: z.string().optional().describe('Cursor: ID of the object to start after'),
  max_items: z.number().int().min(1).optional().describe('Hard cap on total items to fetch across all pages'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_intents_list',
    description: `List PaymentIntents, with optional filtering and auto-pagination.

Use this when:
- You want to review recent payments
- You need to find PaymentIntents for a specific customer or status

Returns: \`{ total_count, has_more, data }\` envelope of Stripe PaymentIntent objects.
Stripe docs: https://stripe.com/docs/api/payment_intents/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Page size per request (max 100, default 100)' },
        customer: { type: 'string', description: 'Only return PaymentIntents for this customer ID' },
        status: {
          type: 'string',
          enum: [
            'requires_payment_method',
            'requires_confirmation',
            'succeeded',
            'canceled',
            'processing',
            'requires_action',
          ],
          description: 'Only return PaymentIntents with this status',
        },
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
      const listParams = buildStripeParams<Stripe.PaymentIntentListParams>({
        customer: parsed.data.customer,
        status: parsed.data.status,
        limit: parsed.data.limit,
        starting_after: parsed.data.starting_after,
      });
      const data = await paginateAll<Stripe.PaymentIntent>(
        (p) => stripe.paymentIntents.list({ ...listParams, ...p }),
        parsed.data.max_items !== undefined ? { maxItems: parsed.data.max_items } : undefined,
      );
      return JSON.stringify(listEnvelope<Stripe.PaymentIntent>(data), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
