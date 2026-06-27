import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  payout_id: z
    .string()
    .min(1)
    .describe('The ID of the payout to cancel (must be in "pending" status).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payouts_cancel',
    description:
      'Cancel a previously created payout. Only payouts in "pending" status can be canceled; Stripe refunds the funds to your available balance. Automatic Stripe payouts cannot be canceled.',
    inputSchema: {
      type: 'object',
      properties: {
        payout_id: { type: 'string', description: 'The payout ID to cancel (e.g. "po_...").' },
      },
      required: ['payout_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const payout = await stripe.payouts.cancel(parsed.data.payout_id);
      return JSON.stringify(payout, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
