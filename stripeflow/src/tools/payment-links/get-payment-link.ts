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
    .describe('The ID of the payment link to retrieve (e.g. "plink_1Nabc...").'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Fields to expand (e.g. ["line_items"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_links_get',
    description: `Retrieve a single payment link by its ID.

Use this when:
- you need the live URL of an existing payment link
- you want to inspect line items, tax settings, and active state
- you are verifying a link before sharing it with customers

Returns: the full Stripe PaymentLink object (id, url, line_items, active, metadata).
Stripe docs: https://stripe.com/docs/api/payment_links/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_link_id: {
          type: 'string',
          description: 'The ID of the payment link to retrieve (e.g. "plink_1Nabc...").',
        },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to expand (e.g. ["line_items"]).',
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
      const result = await stripe.paymentLinks.retrieve(
        parsed.data.payment_link_id,
        buildStripeParams<Stripe.PaymentLinkRetrieveParams>({
          expand: parsed.data.expand,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
