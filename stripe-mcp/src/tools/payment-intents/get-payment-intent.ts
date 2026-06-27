import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  payment_intent_id: z.string().describe('ID of the PaymentIntent to retrieve (e.g. pi_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_intents_get',
    description: `Retrieve a single PaymentIntent by ID.

Use this when:
- You need to check the status of a payment
- You want to inspect the charges, amount, or metadata on a PaymentIntent

Returns: the Stripe PaymentIntent object.
Stripe docs: https://stripe.com/docs/api/payment_intents/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_intent_id: { type: 'string', description: 'ID of the PaymentIntent to retrieve (e.g. pi_1abc23)' },
      },
      required: ['payment_intent_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.paymentIntents.retrieve(
        parsed.data.payment_intent_id,
        buildStripeParams<Stripe.PaymentIntentRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
