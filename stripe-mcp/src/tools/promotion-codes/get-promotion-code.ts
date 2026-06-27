import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  promotion_code_id: z
    .string()
    .min(1)
    .describe('The ID of the promotion code to retrieve (e.g. "promo_1Nabc...").'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Fields to expand (e.g. ["coupon", "customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_promotion_codes_get',
    description: `Retrieve a single promotion code by its ID.

Use this when:
- you need to check the active state, redemption count, or restrictions of a code
- you want to verify a customer-facing code before launching a campaign

Returns: the full Stripe PromotionCode object (id, code, coupon, active, times_redeemed, restrictions).
Stripe docs: https://stripe.com/docs/api/promotion_codes/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        promotion_code_id: {
          type: 'string',
          description: 'The ID of the promotion code to retrieve (e.g. "promo_1Nabc...").',
        },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to expand (e.g. ["coupon", "customer"]).',
        },
      },
      required: ['promotion_code_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.promotionCodes.retrieve(
        parsed.data.promotion_code_id,
        buildStripeParams<Stripe.PromotionCodeRetrieveParams>({
          expand: parsed.data.expand,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
