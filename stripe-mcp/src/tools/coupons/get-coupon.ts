import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  coupon_id: z
    .string()
    .min(1)
    .describe('The ID of the coupon to retrieve (e.g. "25OFF" or "coupon_1Nabc...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_coupons_get',
    description: `Retrieve a single coupon by its ID.

Use this when:
- you need to inspect a coupon's discount rules, validity, and redemption counts
- you want to verify a coupon exists before applying it to a customer

Returns: the full Stripe Coupon object (id, percent_off/amount_off, duration, times_redeemed, etc.).
Stripe docs: https://stripe.com/docs/api/coupons/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        coupon_id: {
          type: 'string',
          description: 'The ID of the coupon to retrieve (e.g. "25OFF" or "coupon_1Nabc...").',
        },
      },
      required: ['coupon_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.coupons.retrieve(parsed.data.coupon_id);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
