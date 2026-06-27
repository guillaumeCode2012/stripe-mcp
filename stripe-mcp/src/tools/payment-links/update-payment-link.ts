import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  payment_link_id: z
    .string()
    .min(1)
    .describe('The ID of the payment link to update (e.g. "plink_1Nabc...").'),
  active: z
    .boolean()
    .optional()
    .describe('Set false to deactivate the link (visitors see an inactive page). Set true to reactivate.'),
  line_items: z
    .array(
      z.object({
        price: z.string().min(1).describe('The ID of the Price object to sell.'),
        quantity: z.number().int().min(1).describe('Quantity of this line item.'),
      }),
    )
    .optional()
    .describe('Replacement line items (up to 20). Replaces the existing set entirely.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Updated key-value metadata.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_links_update',
    description: `Update an existing payment link's active state, line items, or metadata.

Use this when:
- you need to pause a link without deleting it (set active=false)
- you want to swap prices or quantities on an existing link
- you are updating metadata for tracking purposes

Returns: the updated Stripe PaymentLink object.
Stripe docs: https://stripe.com/docs/api/payment_links/update`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_link_id: {
          type: 'string',
          description: 'The ID of the payment link to update (e.g. "plink_1Nabc...").',
        },
        active: {
          type: 'boolean',
          description: 'Set false to deactivate the link (visitors see an inactive page). Set true to reactivate.',
        },
        line_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              price: { type: 'string', description: 'The ID of the Price object to sell.' },
              quantity: { type: 'integer', minimum: 1, description: 'Quantity of this line item.' },
            },
            required: ['price', 'quantity'],
          },
          description: 'Replacement line items (up to 20). Replaces the existing set entirely.',
        },
        metadata: {
          type: 'object',
          description: 'Updated key-value metadata.',
        },
      },
      required: ['payment_link_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { payment_link_id, ...updates } = parsed.data;
      const result = await stripe.paymentLinks.update(
        payment_link_id,
        buildStripeParams<Stripe.PaymentLinkUpdateParams>(updates),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
