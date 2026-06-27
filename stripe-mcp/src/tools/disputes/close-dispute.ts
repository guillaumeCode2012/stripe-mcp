import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  dispute_id: z.string().describe('ID of the dispute to close (e.g. dp_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_disputes_close',
    description: `Close a dispute, forfeiting the dispute to the customer.

Use this when:
- You decide NOT to challenge a dispute
- You want to accept the chargeback immediately

Returns: the closed Stripe Dispute object (status: lost).
Stripe docs: https://stripe.com/docs/api/disputes/close`,
    inputSchema: {
      type: 'object',
      properties: {
        dispute_id: { type: 'string', description: 'ID of the dispute to close (e.g. dp_1abc23)' },
      },
      required: ['dispute_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.disputes.close(parsed.data.dispute_id);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
