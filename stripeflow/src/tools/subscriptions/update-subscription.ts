import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  subscription_id: z
    .string()
    .describe('ID of the subscription to update (sub_...).'),
  items: z
    .array(
      z.object({
        id: z
          .string()
          .optional()
          .describe('Existing subscription item ID (si_...) — required to update an existing item.'),
        price: z
          .string()
          .optional()
          .describe('ID of the new Price (price_...) — set to swap the price on an item.'),
        quantity: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe('New quantity. Set to 0 to remove the item.'),
        deleted: z
          .boolean()
          .optional()
          .describe('Set to true (with the item id) to delete that subscription item.'),
      }),
    )
    .optional()
    .describe('Subscription items to add, update, or remove.'),
  coupon: z
    .string()
    .optional()
    .describe('ID of a coupon to apply (pass empty string to clear).'),
  proration_behavior: z
    .enum(['none', 'create_prorations', 'always_invoice'])
    .optional()
    .describe('How to handle prorations from this update.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata (max 50 keys).'),
  default_payment_method: z
    .string()
    .optional()
    .describe('ID of the PaymentMethod to use as default (pm_...).'),
  cancel_at_period_end: z
    .boolean()
    .optional()
    .describe('If true, the subscription will cancel at the end of the current period.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["latest_invoice"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_update',
    description: `Update an existing subscription.

Use this when:
- Upgrading or downgrading a customer's plan
- Changing item quantities
- Applying or removing a coupon
- Scheduling cancellation at period end

Returns: the updated Stripe Subscription object.
Stripe docs: https://stripe.com/docs/api/subscriptions/update`,
    inputSchema: {
      type: 'object',
      properties: {
        subscription_id: {
          type: 'string',
          description: 'ID of the subscription to update (sub_...).',
        },
        items: {
          type: 'array',
          description: 'Subscription items to add, update, or remove.',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Existing subscription item ID (si_...).' },
              price: { type: 'string', description: 'ID of the new Price (price_...).' },
              quantity: {
                type: 'integer',
                description: 'New quantity. Set to 0 to remove the item.',
                minimum: 0,
              },
              deleted: {
                type: 'boolean',
                description: 'Set to true (with the item id) to delete that item.',
              },
            },
          },
        },
        coupon: { type: 'string', description: 'ID of a coupon to apply.' },
        proration_behavior: {
          type: 'string',
          enum: ['none', 'create_prorations', 'always_invoice'],
          description: 'How to handle prorations from this update.',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata (max 50 keys).',
        },
        default_payment_method: {
          type: 'string',
          description: 'ID of the PaymentMethod to use as default (pm_...).',
        },
        cancel_at_period_end: {
          type: 'boolean',
          description: 'If true, the subscription cancels at the end of the current period.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["latest_invoice"]).',
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
      const { subscription_id, ...rest } = parsed.data;
      const result = await stripe.subscriptions.update(
        subscription_id,
        buildStripeParams<Stripe.SubscriptionUpdateParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
