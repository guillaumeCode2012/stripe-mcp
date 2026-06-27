import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  price_id: z.string().min(1).describe('Stripe price ID (e.g. "price_1a2b3c")'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Fields to expand. Commonly useful values: "product", "tiers".'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_prices_get',
    description: `Retrieve a single Stripe price by ID.

Use this when:
- You need the full Price object (amount, currency, recurring config, product link)
- You want to expand the related Product object

Returns: the Stripe Price object.
Stripe docs: https://stripe.com/docs/api/prices/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        price_id: { type: 'string', description: 'Stripe price ID (e.g. "price_1a2b3c")' },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to expand. Commonly useful values: "product", "tiers".',
        },
      },
      required: ['price_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.prices.retrieve(
        parsed.data.price_id,
        buildStripeParams<Stripe.PriceRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
