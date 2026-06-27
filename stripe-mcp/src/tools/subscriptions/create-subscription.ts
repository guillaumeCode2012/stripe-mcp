import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  customer: z
    .string()
    .describe('ID of the customer to subscribe (cus_...)'),
  items: z
    .array(
      z.object({
        price: z.string().describe('ID of the Price to subscribe to (price_...)'),
        quantity: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Quantity of the item to subscribe to (often 1). Defaults to 1.'),
      }),
    )
    .nonempty()
    .describe('Array of subscription items, each binding a Price to a quantity.'),
  coupon: z
    .string()
    .optional()
    .describe('ID of a coupon to apply to the subscription (coupon_... or promotion code).'),
  trial_period_days: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Days to trial before the first charge. Overrides any price-level trial.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata (max 50 keys, keys & values are strings).'),
  default_payment_method: z
    .string()
    .optional()
    .describe('ID of the PaymentMethod to use as the default for this subscription (pm_...).'),
  proration_behavior: z
    .enum(['none', 'create_prorations', 'always_invoice'])
    .optional()
    .describe('How to handle prorations on the initial invoice. Defaults to create_prorations.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["latest_invoice", "customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_create',
    description: `Create a new subscription for a customer.

Use this when:
- A customer upgrades to a paid plan
- You need to start recurring billing
- You want to add a new line item to recurring billing

Returns: the created Stripe Subscription object.
Stripe docs: https://stripe.com/docs/api/subscriptions/create`,
    inputSchema: {
      type: 'object',
      properties: {
        customer: {
          type: 'string',
          description: 'ID of the customer to subscribe (cus_...)',
        },
        items: {
          type: 'array',
          description: 'Array of subscription items, each binding a Price to a quantity.',
          items: {
            type: 'object',
            properties: {
              price: { type: 'string', description: 'ID of the Price (price_...)' },
              quantity: {
                type: 'integer',
                description: 'Quantity of the item to subscribe to (often 1).',
                minimum: 1,
              },
            },
            required: ['price'],
          },
        },
        coupon: {
          type: 'string',
          description: 'ID of a coupon to apply (coupon_... or promotion code).',
        },
        trial_period_days: {
          type: 'integer',
          description: 'Days to trial before the first charge.',
          minimum: 0,
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata (max 50 keys).',
        },
        default_payment_method: {
          type: 'string',
          description: 'ID of the PaymentMethod to use as default (pm_...).',
        },
        proration_behavior: {
          type: 'string',
          enum: ['none', 'create_prorations', 'always_invoice'],
          description: 'How to handle prorations on the initial invoice.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["latest_invoice","customer"]).',
          items: { type: 'string' },
        },
      },
      required: ['customer', 'items'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.subscriptions.create(
        buildStripeParams<Stripe.SubscriptionCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
