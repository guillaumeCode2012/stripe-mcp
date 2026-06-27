import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  name: z.string().min(1).describe('Product name (displayable to the customer). Required.'),
  description: z
    .string()
    .optional()
    .describe('Long-form description of the product (displayable to the customer)'),
  images: z
    .array(z.string().url())
    .max(8)
    .optional()
    .describe('Up to 8 image URLs for this product'),
  default_price: z
    .string()
    .optional()
    .describe('ID of an existing Price to set as this product\u2019s default price'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value pairs attached to the product (keys and values are strings)'),
  active: z
    .boolean()
    .optional()
    .describe('Whether the product is available for purchase. Defaults to true.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_products_create',
    description: `Create a new product in Stripe.

Use this when:
- You need a Product to attach Prices to (subscriptions, one-time purchases, etc.)
- A new plan or SKU needs to be added to your catalogue

Returns: the created Stripe Product object.
Stripe docs: https://stripe.com/docs/api/products/create`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name (displayable to the customer). Required.' },
        description: {
          type: 'string',
          description: 'Long-form description of the product (displayable to the customer)',
        },
        images: {
          type: 'array',
          items: { type: 'string' },
          description: 'Up to 8 image URLs for this product',
        },
        default_price: {
          type: 'string',
          description: 'ID of an existing Price to set as this product\u2019s default price',
        },
        metadata: {
          type: 'object',
          description:
            'Arbitrary key-value pairs attached to the product (keys and values are strings)',
          additionalProperties: { type: 'string' },
        },
        active: {
          type: 'boolean',
          description: 'Whether the product is available for purchase. Defaults to true.',
        },
      },
      required: ['name'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.products.create(
        buildStripeParams<Stripe.ProductCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
