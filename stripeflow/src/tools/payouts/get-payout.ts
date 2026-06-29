import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  payout_id: z
    .string()
    .min(1)
    .describe('The ID of the payout to retrieve (e.g. "po_...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payouts_get',
    description:
      'Retrieve the details of an existing payout by ID. Returns the full payout object including status, amount, currency, arrival date, and destination.',
    inputSchema: {
      type: 'object',
      properties: {
        payout_id: { type: 'string', description: 'The payout ID (e.g. "po_...").' },
      },
      required: ['payout_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const payout = await stripe.payouts.retrieve(parsed.data.payout_id);
      return JSON.stringify(payout, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
