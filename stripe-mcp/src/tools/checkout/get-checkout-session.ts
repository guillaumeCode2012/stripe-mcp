import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  session_id: z
    .string()
    .min(1)
    .describe('The ID of the Checkout Session to retrieve (e.g. "cs_test_...").'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Fields to expand (e.g. ["line_items", "customer", "payment_intent"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_checkout_get_session',
    description: `Retrieve a single Checkout Session by its ID.

Use this when:
- you need to confirm a session completed and inspect the payment status
- you want to retrieve customer details or line items after redirect
- you are verifying webhook events against the originating session

Returns: the full Stripe Checkout Session object (id, status, payment_status, customer_details, amount_total).
Stripe docs: https://stripe.com/docs/api/checkout/sessions/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The ID of the Checkout Session to retrieve (e.g. "cs_test_...").',
        },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to expand (e.g. ["line_items", "customer", "payment_intent"]).',
        },
      },
      required: ['session_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.checkout.sessions.retrieve(
        parsed.data.session_id,
        buildStripeParams<Stripe.Checkout.SessionRetrieveParams>({
          expand: parsed.data.expand,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
