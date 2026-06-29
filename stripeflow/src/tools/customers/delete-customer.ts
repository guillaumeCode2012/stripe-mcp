import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  customer_id: z
    .string()
    .min(1)
    .describe('Stripe customer ID to permanently delete (e.g. "cus_1a2b3c")'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_delete',
    description: `Permanently delete a Stripe customer.

Use this when:
- A user requests account deletion (GDPR / right-to-be-forgotten)
- You are cleaning up test customers

IMPORTANT: this cannot be undone. It also immediately cancels any active subscriptions on the customer.

Returns: a Stripe DeletedCustomer object (with \`deleted: true\`).
Stripe docs: https://stripe.com/docs/api/customers/delete`,
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: {
          type: 'string',
          description: 'Stripe customer ID to permanently delete (e.g. "cus_1a2b3c")',
        },
      },
      required: ['customer_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.customers.del(parsed.data.customer_id);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
