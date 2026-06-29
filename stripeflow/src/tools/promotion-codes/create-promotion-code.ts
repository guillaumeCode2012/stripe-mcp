import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  coupon: z
    .string()
    .min(1)
    .describe('The ID of the Coupon (e.g. "25OFF") this promotion code will redeem.'),
  code: z
    .string()
    .optional()
    .describe('Customer-facing code (a-z, A-Z, 0-9, dashes). If omitted, Stripe generates one.'),
  customer: z
    .string()
    .optional()
    .describe('Customer ID restricted to redeem this code. If omitted, any customer can redeem.'),
  max_redemptions: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum total redemptions allowed for this code.'),
  expires_at: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Unix timestamp (seconds) at which this promotion code expires.'),
  active: z
    .boolean()
    .optional()
    .describe('Whether the promotion code is currently active. Defaults to true.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata attached to the promotion code.'),
  restrictions: z
    .object({
      minimum_amount: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Minimum order amount (cents) required to redeem.'),
      minimum_amount_currency: z
        .string()
        .optional()
        .describe('Three-letter ISO currency code for minimum_amount.'),
      first_time_transaction: z
        .boolean()
        .optional()
        .describe('If true, only redeemable by customers with no prior successful payments.'),
    })
    .optional()
    .describe('Restrictions applied to redemption of this code.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_promotion_codes_create',
    description: `Create a customer-redeemable promotion code backed by an existing coupon.

Use this when:
- you have a coupon and want a shareable, customer-facing code (e.g. "WELCOME20")
- you want to restrict redemption to a single customer or a minimum order amount
- you are launching a marketing campaign with limited-use codes

Returns: the full Stripe PromotionCode object (id, code, coupon, active, restrictions, times_redeemed).
Stripe docs: https://stripe.com/docs/api/promotion_codes/create`,
    inputSchema: {
      type: 'object',
      properties: {
        coupon: {
          type: 'string',
          description: 'The ID of the Coupon (e.g. "25OFF") this promotion code will redeem.',
        },
        code: {
          type: 'string',
          description: 'Customer-facing code (a-z, A-Z, 0-9, dashes). If omitted, Stripe generates one.',
        },
        customer: {
          type: 'string',
          description: 'Customer ID restricted to redeem this code. If omitted, any customer can redeem.',
        },
        max_redemptions: {
          type: 'integer',
          minimum: 1,
          description: 'Maximum total redemptions allowed for this code.',
        },
        expires_at: {
          type: 'integer',
          minimum: 1,
          description: 'Unix timestamp (seconds) at which this promotion code expires.',
        },
        active: {
          type: 'boolean',
          description: 'Whether the promotion code is currently active. Defaults to true.',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata attached to the promotion code.',
        },
        restrictions: {
          type: 'object',
          properties: {
            minimum_amount: {
              type: 'integer',
              minimum: 0,
              description: 'Minimum order amount (cents) required to redeem.',
            },
            minimum_amount_currency: {
              type: 'string',
              description: 'Three-letter ISO currency code for minimum_amount.',
            },
            first_time_transaction: {
              type: 'boolean',
              description: 'If true, only redeemable by customers with no prior successful payments.',
            },
          },
          description: 'Restrictions applied to redemption of this code.',
        },
      },
      required: ['coupon'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      // The Stripe SDK wraps the coupon ID inside `promotion: { coupon, type: 'coupon' }`.
      // We expose it flatly as `coupon` to callers and translate here.
      const { coupon, ...rest } = parsed.data;
      const params = buildStripeParams<Stripe.PromotionCodeCreateParams>({
        ...rest,
        promotion: { coupon, type: 'coupon' as const },
      });
      const result = await stripe.promotionCodes.create(params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
