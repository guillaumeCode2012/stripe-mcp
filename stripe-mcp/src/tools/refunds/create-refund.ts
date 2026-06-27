import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  payment_intent: z.string().optional().describe('ID of the PaymentIntent to refund (e.g. pi_1abc23)'),
  charge: z.string().optional().describe('ID of the charge to refund (e.g. ch_1abc23)'),
  amount: z.number().int().min(1).optional().describe('Amount to refund in smallest currency unit; defaults to full refund'),
  reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer', 'expired_uncaptured_charge'])
    .optional()
    .describe('Reason for the refund'),
  metadata: z.record(z.string(), z.string()).optional().describe('Set of key-value pairs to attach to the object'),
  refund_application_fee: z.boolean().optional().describe('Refund the application fee on a Connect charge'),
  reverse_transfer: z.boolean().optional().describe('Reverse the transfer on a Connect charge'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_refunds_create',
    description: `Create a refund for a previously captured charge or PaymentIntent.

Use this when:
- A customer requests a refund
- A payment was made in error

Returns: the created Stripe Refund object.
Stripe docs: https://stripe.com/docs/api/refunds/create`,
    inputSchema: {
      type: 'object',
      properties: {
        payment_intent: { type: 'string', description: 'ID of the PaymentIntent to refund (e.g. pi_1abc23)' },
        charge: { type: 'string', description: 'ID of the charge to refund (e.g. ch_1abc23)' },
        amount: { type: 'integer', description: 'Amount to refund in smallest currency unit; defaults to full refund' },
        reason: {
          type: 'string',
          enum: ['duplicate', 'fraudulent', 'requested_by_customer', 'expired_uncaptured_charge'],
          description: 'Reason for the refund',
        },
        metadata: { type: 'object', description: 'Set of key-value pairs to attach to the object' },
        refund_application_fee: { type: 'boolean', description: 'Refund the application fee on a Connect charge' },
        reverse_transfer: { type: 'boolean', description: 'Reverse the transfer on a Connect charge' },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.refunds.create(
        buildStripeParams<Stripe.RefundCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
