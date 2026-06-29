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
    .describe('Page size for each Stripe request (1-100). Use max_items for total cap.'),
  status: z
    .enum([
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'all',
      'trialing',
      'incomplete',
      'incomplete_expired',
      'paused',
    ])
    .optional()
    .describe('Filter by subscription status. Defaults to all non-canceled subscriptions.'),
  customer: z
    .string()
    .optional()
    .describe('Only return subscriptions for this customer (cus_...).'),
  price: z
    .string()
    .optional()
    .describe('Only return subscriptions that contain this Price ID (price_...).'),
  current_period_end: z
    .number()
    .int()
    .optional()
    .describe('Unix timestamp (seconds). Filters subscriptions whose current period ends at this exact time. Use Stripe range query syntax by passing a number directly.'),
  starting_after: z
    .string()
    .optional()
    .describe('Pagination cursor — ID of the last object from the previous page (sub_...).'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on the total number of items returned. Defaults to 1000.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_list',
    description: `List subscriptions with optional filters.

Use this when:
- Showing all of a customer's subscriptions
- Finding past_due or unpaid subscriptions for recovery workflows
- Auditing active subscriptions across the account

Auto-paginates through all matching subscriptions (capped by max_items).
Returns: \`{ total_count, has_more, data }\` envelope.
Stripe docs: https://stripe.com/docs/api/subscriptions/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Page size for each Stripe request (1-100).',
          minimum: 1,
          maximum: 100,
        },
        status: {
          type: 'string',
          enum: [
            'active',
            'past_due',
            'canceled',
            'unpaid',
            'all',
            'trialing',
            'incomplete',
            'incomplete_expired',
            'paused',
          ],
          description: 'Filter by subscription status.',
        },
        customer: {
          type: 'string',
          description: 'Only return subscriptions for this customer (cus_...).',
        },
        price: {
          type: 'string',
          description: 'Only return subscriptions that contain this Price ID (price_...).',
        },
        current_period_end: {
          type: 'integer',
          description: 'Unix timestamp (seconds) to filter by current period end.',
        },
        starting_after: {
          type: 'string',
          description: 'Pagination cursor — ID of the last object from the previous page.',
        },
        max_items: {
          type: 'integer',
          description: 'Hard cap on total items returned. Defaults to 1000.',
          minimum: 1,
        },
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
      const all = await paginateAll<Stripe.Subscription>(
        (p) =>
          stripe.subscriptions.list({
            ...p,
            ...(parsed.data.status ? { status: parsed.data.status } : {}),
            ...(parsed.data.customer ? { customer: parsed.data.customer } : {}),
            ...(parsed.data.price ? { price: parsed.data.price } : {}),
            ...(parsed.data.current_period_end
              ? { current_period_end: parsed.data.current_period_end }
              : {}),
          }),
        { maxItems: parsed.data.max_items ?? 1000 },
      );
      return JSON.stringify(
        { total_count: all.length, has_more: false, data: all },
        null,
        2,
      );
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
