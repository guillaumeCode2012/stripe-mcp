import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  subscription_id: z
    .string()
    .describe('ID of the subscription to retrieve (sub_...).'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["customer","latest_invoice.payment_intent"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_get',
    description: `Retrieve a subscription by ID.

Use this when:
- You need to inspect a subscription's status, items, or billing cycle
- You want to verify the current state before updating or canceling

Returns: the Stripe Subscription object.
Stripe docs: https://stripe.com/docs/api/subscriptions/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        subscription_id: {
          type: 'string',
          description: 'ID of the subscription to retrieve (sub_...).',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["customer","latest_invoice.payment_intent"]).',
          items: { type: 'string' },
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
      const result = await stripe.subscriptions.retrieve(
        parsed.data.subscription_id,
        buildStripeParams<Stripe.SubscriptionRetrieveParams>({
          expand: parsed.data.expand,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
