import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  payment_intent_id: z.string().describe('ID of the PaymentIntent to confirm (e.g. pi_1abc23)'),
  payment_method: z.string().optional().describe('ID of the payment method to use for confirmation'),
  receipt_email: z.string().optional().describe('Email to send the receipt to'),
  return_url: z.string().optional().describe('URL to redirect the customer back to after authentication'),
  mandate: z.string().optional().describe('ID of the mandate to use for this confirmation'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_intents_confirm',
    description: `Confirm a PaymentIntent, kickstarting payment processing.

Use this when:
- You previously created a PaymentIntent and now want to collect payment
- A PaymentIntent requires additional confirmation (e.g. after SCA challenge)

Returns: the confirmed (or still-pending) Stripe PaymentIntent object.
Stripe docs: https://stripe.com/docs/api/payment_intents/confirm`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_intent_id: { type: 'string', description: 'ID of the PaymentIntent to confirm (e.g. pi_1abc23)' },
        payment_method: { type: 'string', description: 'ID of the payment method to use for confirmation' },
        receipt_email: { type: 'string', description: 'Email to send the receipt to' },
        return_url: { type: 'string', description: 'URL to redirect the customer back to after authentication' },
        mandate: { type: 'string', description: 'ID of the mandate to use for this confirmation' },
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
      const result = await stripe.paymentIntents.confirm(
        parsed.data.payment_intent_id,
        buildStripeParams<Stripe.PaymentIntentConfirmParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
