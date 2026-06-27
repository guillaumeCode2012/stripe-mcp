import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  subscription_id: z
    .string()
    .describe('ID of the subscription to pause (sub_...). Must use charge_automatically collection.'),
  behavior: z
    .enum(['void', 'mark_uncollectible', 'keep_as_draft'])
    .optional()
    .describe('How to handle invoices generated while paused. Defaults to void.'),
  resumes_at: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Unix timestamp (seconds) when the subscription should automatically resume.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_pause',
    description: `Pause a subscription's collection cycle.

Use this when:
- A customer temporarily suspends service (vacation, seasonal)
- You want to stop billing without cancelling
- Trial extension scenarios

Behind the scenes this calls \`subscriptions.update\` with \`pause_collection\`.
Returns: the updated Stripe Subscription object (with pause_collection populated).
Stripe docs: https://stripe.com/docs/billing/subscriptions/pause`,
    inputSchema: {
      type: 'object',
      properties: {
        subscription_id: {
          type: 'string',
          description: 'ID of the subscription to pause (sub_...).',
        },
        behavior: {
          type: 'string',
          enum: ['void', 'mark_uncollectible', 'keep_as_draft'],
          description: 'How to handle invoices generated while paused. Defaults to void.',
        },
        resumes_at: {
          type: 'integer',
          description: 'Unix timestamp (seconds) when the subscription should resume.',
          minimum: 1,
        },
      },
      required: ['subscription_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { subscription_id, behavior, resumes_at } = parsed.data;
      const pauseCollection: Stripe.SubscriptionUpdateParams.PauseCollection = {
        // Stripe requires `behavior` on pause_collection. Default to 'void'
        // (Stripe's documented default) when the caller doesn't specify one.
        behavior: behavior ?? 'void',
        ...(resumes_at ? { resumes_at } : {}),
      };
      const result = await stripe.subscriptions.update(
        subscription_id,
        buildStripeParams<Stripe.SubscriptionUpdateParams>({
          pause_collection: pauseCollection,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
