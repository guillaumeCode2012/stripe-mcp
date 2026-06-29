import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  product_id: z
    .string()
    .min(1)
    .describe('Stripe product ID (e.g. "prod_1a2b3c")'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Fields to expand. Commonly useful values: "default_price".'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_products_get',
    description: `Retrieve a single Stripe product by ID.

Use this when:
- You need the full product object (name, description, images, default price, active flag)
- You want to expand the default_price relationship

Returns: the Stripe Product object.
Stripe docs: https://stripe.com/docs/api/products/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Stripe product ID (e.g. "prod_1a2b3c")' },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to expand. Commonly useful values: "default_price".',
        },
      },
      required: ['product_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.products.retrieve(
        parsed.data.product_id,
        buildStripeParams<Stripe.ProductRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
