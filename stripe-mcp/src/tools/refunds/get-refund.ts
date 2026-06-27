import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  refund_id: z.string().describe('ID of the refund to retrieve (e.g. re_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_refunds_get',
    description: `Retrieve a single refund by ID.

Use this when:
- You want to check the status of a refund
- You need to inspect the metadata or amount on a refund

Returns: the Stripe Refund object.
Stripe docs: https://stripe.com/docs/api/refunds/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        refund_id: { type: 'string', description: 'ID of the refund to retrieve (e.g. re_1abc23)' },
      },
      required: ['refund_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.refunds.retrieve(
        parsed.data.refund_id,
        buildStripeParams<Stripe.RefundRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
