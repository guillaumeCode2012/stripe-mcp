import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  percent_off: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('A positive float (0..100) representing the discount percent. Required if amount_off is not given.'),
  amount_off: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Positive integer (cents) to subtract from an invoice total. Required if percent_off is not given.'),
  currency: z
    .string()
    .optional()
    .describe('Three-letter ISO currency code (lowercase). Required when amount_off is set.'),
  duration: z
    .enum(['once', 'repeating', 'forever'])
    .describe('How long the discount lasts when applied to a subscription.'),
  duration_in_months: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Number of months the discount is in effect. Required when duration="repeating".'),
  max_redemptions: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of times this coupon can be redeemed.'),
  redeem_by: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Unix timestamp (seconds) of the last time the coupon can be redeemed.'),
  name: z
    .string()
    .optional()
    .describe('Display name shown to customers on invoices and receipts.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata attached to the coupon.'),
  applies_to: z
    .object({
      products: z.array(z.string()).describe('Product IDs this coupon applies to.'),
    })
    .optional()
    .describe('Restrict the coupon to specific products.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_coupons_create',
    description: `Create a coupon that can be applied to subscriptions or invoices for a discount.

Use this when:
- you need a percentage discount (e.g. 20% off) on a subscription or invoice
- you need a fixed-amount discount (e.g. $5 off) in a specific currency
- you are configuring promotional offers before generating redeemable codes

Returns: the full Stripe Coupon object (id, percent_off/amount_off, duration, validity, metadata).
Stripe docs: https://stripe.com/docs/api/coupons/create`,
    inputSchema: {
      type: 'object',
      properties: {
        percent_off: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'A positive float (0..100) representing the discount percent. Required if amount_off is not given.',
        },
        amount_off: {
          type: 'integer',
          minimum: 0,
          description: 'Positive integer (cents) to subtract from an invoice total. Required if percent_off is not given.',
        },
        currency: {
          type: 'string',
          description: 'Three-letter ISO currency code (lowercase). Required when amount_off is set.',
        },
        duration: {
          type: 'string',
          enum: ['once', 'repeating', 'forever'],
          description: 'How long the discount lasts when applied to a subscription.',
        },
        duration_in_months: {
          type: 'integer',
          minimum: 1,
          description: 'Number of months the discount is in effect. Required when duration="repeating".',
        },
        max_redemptions: {
          type: 'integer',
          minimum: 1,
          description: 'Maximum number of times this coupon can be redeemed.',
        },
        redeem_by: {
          type: 'integer',
          minimum: 1,
          description: 'Unix timestamp (seconds) of the last time the coupon can be redeemed.',
        },
        name: {
          type: 'string',
          description: 'Display name shown to customers on invoices and receipts.',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata attached to the coupon.',
        },
        applies_to: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: { type: 'string' },
              description: 'Product IDs this coupon applies to.',
            },
          },
          description: 'Restrict the coupon to specific products.',
        },
      },
      required: ['duration'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.coupons.create(
        buildStripeParams<Stripe.CouponCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
