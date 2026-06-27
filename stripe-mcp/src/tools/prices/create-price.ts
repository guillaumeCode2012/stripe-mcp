import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const recurringSchema = z
  .object({
    interval: z
      .enum(['day', 'week', 'month', 'year'])
      .describe('Billing frequency: day, week, month, or year'),
    interval_count: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe(
        'Number of intervals between billings. E.g. interval=month, interval_count=3 bills every 3 months. Max 3 years.',
      ),
  })
  .describe('Recurring price configuration. Omit for a one-time price.');

const productDataSchema = z
  .object({
    name: z.string().min(1).describe('Name of the new product to create alongside this price'),
  })
  .describe('Use this to create a new product inline. Mutually exclusive with `product`.');

const inputSchema = z
  .object({
    unit_amount: z
      .number()
      .int()
      .min(0)
      .describe(
        'Price amount in the smallest currency unit (e.g. cents for USD). 0 for a free price.',
      ),
    currency: z
      .string()
      .min(3)
      .max(3)
      .regex(/^[a-z]{3}$/, 'currency must be a lowercase 3-letter ISO code')
      .describe('Lowercase 3-letter ISO currency code (e.g. "usd", "eur", "jpy")'),
    product: z
      .string()
      .optional()
      .describe(
        'ID of an existing product this price belongs to. Either this or `product_data` is required (one of them).',
      ),
    product_data: productDataSchema.optional(),
    recurring: recurringSchema.optional(),
    nickname: z
      .string()
      .optional()
      .describe('Internal nickname for the price (hidden from customers)'),
    lookup_key: z
      .string()
      .optional()
      .describe('Lookup key used to retrieve prices dynamically from a static string'),
    metadata: z
      .record(z.string(), z.string())
      .optional()
      .describe('Arbitrary key-value pairs attached to the price'),
    active: z
      .boolean()
      .optional()
      .describe('Whether the price can be used for new purchases. Defaults to true.'),
  })
  .refine(
    (data) => data.product !== undefined || data.product_data !== undefined,
    {
      message:
        'Either "product" (existing product ID) or "product_data" (inline new product) must be provided.',
    },
  );

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_prices_create',
    description: `Create a new Price in Stripe.

Use this when:
- You want to charge a fixed amount for a product (one-time or recurring)
- You need a new pricing tier (e.g. monthly vs yearly) for an existing product

You must provide exactly one of \`product\` (existing product ID) or \`product_data\` (to create a new product inline). \`unit_amount\` is in the smallest currency unit (cents for USD/EUR, whole units for zero-decimal currencies like JPY).

Returns: the created Stripe Price object.
Stripe docs: https://stripe.com/docs/api/prices/create`,
    inputSchema: {
      type: 'object',
      properties: {
        unit_amount: {
          type: 'integer',
          minimum: 0,
          description:
            'Price amount in the smallest currency unit (e.g. cents for USD). 0 for a free price.',
        },
        currency: {
          type: 'string',
          description: 'Lowercase 3-letter ISO currency code (e.g. "usd", "eur", "jpy")',
        },
        product: {
          type: 'string',
          description:
            'ID of an existing product this price belongs to. Either this or `product_data` is required (one of them).',
        },
        product_data: {
          type: 'object',
          description: 'Use this to create a new product inline. Mutually exclusive with `product`.',
          properties: {
            name: { type: 'string', description: 'Name of the new product to create alongside this price' },
          },
          required: ['name'],
        },
        recurring: {
          type: 'object',
          description: 'Recurring price configuration. Omit for a one-time price.',
          properties: {
            interval: {
              type: 'string',
              enum: ['day', 'week', 'month', 'year'],
              description: 'Billing frequency: day, week, month, or year',
            },
            interval_count: {
              type: 'integer',
              minimum: 1,
              description:
                'Number of intervals between billings. E.g. interval=month, interval_count=3 bills every 3 months. Max 3 years.',
            },
          },
          required: ['interval'],
        },
        nickname: {
          type: 'string',
          description: 'Internal nickname for the price (hidden from customers)',
        },
        lookup_key: {
          type: 'string',
          description: 'Lookup key used to retrieve prices dynamically from a static string',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value pairs attached to the price',
          additionalProperties: { type: 'string' },
        },
        active: {
          type: 'boolean',
          description: 'Whether the price can be used for new purchases. Defaults to true.',
        },
      },
      required: ['unit_amount', 'currency'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.prices.create(
        buildStripeParams<Stripe.PriceCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
