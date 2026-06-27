import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_balance_get',
    description: `Retrieve the current Stripe account balance across all currencies.

Use this when:
- you need to show available vs. pending funds in a dashboard
- you are reconciling your Stripe balance against your bank payouts
- you want a quick health check that the Stripe API key is configured

Returns: the Stripe Balance object (available, pending, instant_available, livemode).
Stripe docs: https://stripe.com/docs/api/balance/balance_retrieve`,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.balance.retrieve();
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
