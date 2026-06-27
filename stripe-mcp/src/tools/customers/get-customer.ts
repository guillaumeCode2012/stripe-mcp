import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  customer_id: z
    .string()
    .min(1)
    .describe('Stripe customer ID (e.g. "cus_1a2b3c")'),
  expand: z
    .array(z.string())
    .optional()
    .describe(
      'Fields to expand. Commonly useful values: "default_payment_method", "subscriptions", "sources", "invoice_settings.default_payment_method".',
    ),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_get',
    description: `Retrieve a single Stripe customer by ID.

Use this when:
- You need the full customer object (email, name, balance, default payment method, etc.)
- You need to expand related objects like subscriptions or default payment method

Returns: the Stripe Customer object (or a DeletedCustomer if it was deleted).
Stripe docs: https://stripe.com/docs/api/customers/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'string', description: 'Stripe customer ID (e.g. "cus_1a2b3c")' },
        expand: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Fields to expand. Commonly useful values: "default_payment_method", "subscriptions", "sources", "invoice_settings.default_payment_method".',
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
      const result = await stripe.customers.retrieve(
        parsed.data.customer_id,
        buildStripeParams<Stripe.CustomerRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
