import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  dispute_id: z.string().describe('ID of the dispute to retrieve (e.g. dp_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_disputes_get',
    description: `Retrieve a single dispute by ID.

Use this when:
- You need to inspect the evidence on a chargeback
- You want to check the status or amount of a dispute

Returns: the Stripe Dispute object.
Stripe docs: https://stripe.com/docs/api/disputes/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        dispute_id: { type: 'string', description: 'ID of the dispute to retrieve (e.g. dp_1abc23)' },
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
      const result = await stripe.disputes.retrieve(
        parsed.data.dispute_id,
        buildStripeParams<Stripe.DisputeRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
