import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  price_id: z.string().min(1).describe('Stripe price ID to update (e.g. "price_1a2b3c")'),
  nickname: z
    .string()
    .optional()
    .describe('New internal nickname for the price (hidden from customers)'),
  lookup_key: z
    .string()
    .optional()
    .describe(
      'New lookup key used to retrieve prices dynamically. Pass an empty string to unset.',
    ),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value pairs to attach. Pass an empty string to unset a key.'),
  active: z
    .boolean()
    .optional()
    .describe(
      'Whether the price can be used for new purchases. Set to false to deprecate a price without deleting it.',
    ),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_prices_update',
    description: `Update an existing Stripe price.

Use this when:
- You want to rename (nick) a price for internal clarity
- You want to set or update a lookup_key
- You want to deactivate a price so it can\u2019t be used for new purchases (without deleting it)

Note: Stripe does NOT allow updating \`unit_amount\`, \`currency\`, \`recurring\`, or \`product\` on an existing price \u2014 create a new price instead.

Returns: the updated Stripe Price object.
Stripe docs: https://stripe.com/docs/api/prices/update`,
    inputSchema: {
      type: 'object',
      properties: {
        price_id: { type: 'string', description: 'Stripe price ID to update (e.g. "price_1a2b3c")' },
        nickname: {
          type: 'string',
          description: 'New internal nickname for the price (hidden from customers)',
        },
        lookup_key: {
          type: 'string',
          description:
            'New lookup key used to retrieve prices dynamically. Pass an empty string to unset.',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value pairs to attach. Pass an empty string to unset a key.',
          additionalProperties: { type: 'string' },
        },
        active: {
          type: 'boolean',
          description:
            'Whether the price can be used for new purchases. Set to false to deprecate a price without deleting it.',
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
      const { price_id: priceId, ...rest } = parsed.data;
      const result = await stripe.prices.update(
        priceId,
        buildStripeParams<Stripe.PriceUpdateParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
