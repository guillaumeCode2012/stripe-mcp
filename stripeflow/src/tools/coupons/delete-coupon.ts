import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  coupon_id: z
    .string()
    .min(1)
    .describe('The ID of the coupon to delete (e.g. "25OFF" or "coupon_1Nabc...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_coupons_delete',
    description: `Permanently delete a coupon. Existing customers on the coupon keep their discount.

Use this when:
- a promotion has ended and you want to prevent new redemptions
- you are cleaning up test coupons in a non-live environment

Returns: a Stripe deletion confirmation object (\`{ id, object: "coupon", deleted: true }\`).
Stripe docs: https://stripe.com/docs/api/coupons/delete`,
    inputSchema: {
      type: 'object',
      properties: {
        coupon_id: {
          type: 'string',
          description: 'The ID of the coupon to delete (e.g. "25OFF" or "coupon_1Nabc...").',
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
      const result = await stripe.coupons.del(parsed.data.coupon_id);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
