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
    .describe('Stripe product ID to update (e.g. "prod_1a2b3c")'),
  name: z.string().min(1).optional().describe('New product name'),
  description: z.string().optional().describe('New product description'),
  images: z
    .array(z.string().url())
    .max(8)
    .optional()
    .describe('New list of up to 8 image URLs (replaces the existing list)'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value pairs to attach. Pass an empty string to unset a key.'),
  active: z.boolean().optional().describe('Whether the product is available for purchase'),
  default_price: z
    .string()
    .optional()
    .describe('ID of a Price to set as this product\u2019s new default price'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_products_update',
    description: `Update an existing Stripe product.

Use this when:
- You need to rename a product, change its description, or swap images
- You want to change the default price for a product
- You want to (de)activate a product without fully archiving it (use archive-product for the standard archive flow)

Returns: the updated Stripe Product object.
Stripe docs: https://stripe.com/docs/api/products/update`,
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Stripe product ID to update (e.g. "prod_1a2b3c")' },
        name: { type: 'string', description: 'New product name' },
        description: { type: 'string', description: 'New product description' },
        images: {
          type: 'array',
          items: { type: 'string' },
          description: 'New list of up to 8 image URLs (replaces the existing list)',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value pairs to attach. Pass an empty string to unset a key.',
          additionalProperties: { type: 'string' },
        },
        active: { type: 'boolean', description: 'Whether the product is available for purchase' },
        default_price: {
          type: 'string',
          description: 'ID of a Price to set as this product\u2019s new default price',
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
      const { product_id: productId, ...rest } = parsed.data;
      const result = await stripe.products.update(
        productId,
        buildStripeParams<Stripe.ProductUpdateParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
