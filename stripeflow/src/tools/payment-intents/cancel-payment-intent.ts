import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  payment_intent_id: z.string().describe('ID of the PaymentIntent to cancel (e.g. pi_1abc23)'),
  cancellation_reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer', 'abandoned'])
    .optional()
    .describe('Reason for the cancellation'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_intents_cancel',
    description: `Cancel a PaymentIntent that has not yet been captured.

Use this when:
- A customer abandons checkout
- A payment is suspected to be fraudulent
- The PaymentIntent was created in error

Returns: the canceled Stripe PaymentIntent object.
Stripe docs: https://stripe.com/docs/api/payment_intents/cancel`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_intent_id: { type: 'string', description: 'ID of the PaymentIntent to cancel (e.g. pi_1abc23)' },
        cancellation_reason: {
          type: 'string',
          enum: ['duplicate', 'fraudulent', 'requested_by_customer', 'abandoned'],
          description: 'Reason for the cancellation',
        },
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
      const result = await stripe.paymentIntents.cancel(
        parsed.data.payment_intent_id,
        buildStripeParams<Stripe.PaymentIntentCancelParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
