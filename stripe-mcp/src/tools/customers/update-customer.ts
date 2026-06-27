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
    .describe('Stripe customer ID to update (e.g. "cus_1a2b3c")'),
  email: z.string().email().optional().describe('New customer email address'),
  name: z.string().optional().describe('New customer full name or business name'),
  phone: z.string().optional().describe('New customer phone number'),
  description: z.string().optional().describe('New internal description'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Arbitrary key-value pairs to attach. Pass an empty string for a key to unset it.',
    ),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_update',
    description: `Update an existing Stripe customer.

Use this when:
- A customer changes their email, name, phone, or description
- You want to attach or update metadata on a customer

Returns: the updated Stripe Customer object.
Stripe docs: https://stripe.com/docs/api/customers/update`,
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: 'string', description: 'Stripe customer ID to update (e.g. "cus_1a2b3c")' },
        email: { type: 'string', description: 'New customer email address' },
        name: { type: 'string', description: 'New customer full name or business name' },
        phone: { type: 'string', description: 'New customer phone number' },
        description: { type: 'string', description: 'New internal description' },
        metadata: {
          type: 'object',
          description:
            'Arbitrary key-value pairs to attach. Pass an empty string for a key to unset it.',
          additionalProperties: { type: 'string' },
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
      const { customer_id: customerId, ...rest } = parsed.data;
      const result = await stripe.customers.update(
        customerId,
        buildStripeParams<Stripe.CustomerUpdateParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
