import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  session_id: z
    .string()
    .min(1)
    .describe('The ID of an open Checkout Session to expire (e.g. "cs_test_...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_checkout_expire_session',
    description: `Expire an open Checkout Session so it can no longer be completed by customers.

Use this when:
- a customer abandoned checkout and you want to free the inventory or pricing hold
- you need to invalidate a stale session programmatically
- you are cleaning up sessions as part of an order-cancellation flow

Returns: the expired Stripe Checkout Session object with status="expired".
Stripe docs: https://stripe.com/docs/api/checkout/sessions/expire`,
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The ID of an open Checkout Session to expire (e.g. "cs_test_...").',
        },
      },
      required: ['session_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.checkout.sessions.expire(
        parsed.data.session_id,
        buildStripeParams<Stripe.Checkout.SessionExpireParams>({}),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
