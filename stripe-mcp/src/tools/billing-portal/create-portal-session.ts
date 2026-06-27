import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  customer: z
    .string()
    .min(1)
    .describe('The ID of an existing customer who will access the billing portal.'),
  return_url: z
    .string()
    .optional()
    .describe('URL the customer is redirected to after leaving the portal.'),
  configuration: z
    .string()
    .optional()
    .describe('ID of a portal configuration to use. If omitted, the default configuration is used.'),
  flow_data: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Deep-link flow config (e.g. { type: "subscription_cancel", subscription_cancel: { subscription: "sub_..." } }). See Stripe portal deep-links docs.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_billing_portal_create_session',
    description: `Create a short-lived Stripe Customer Portal session URL for a customer to self-manage subscriptions and billing details.

Use this when:
- a customer wants to update their payment method or subscription plan
- you need to deep-link the customer into a specific portal flow (e.g. cancel a subscription)
- you are building an account/billing page in your app

Returns: the Stripe Billing Portal Session object (id, url, customer, return_url).
Stripe docs: https://stripe.com/docs/api/customer_portal/sessions/create`,
    inputSchema: {
      type: 'object',
      properties: {
        customer: {
          type: 'string',
          description: 'The ID of an existing customer who will access the billing portal.',
        },
        return_url: {
          type: 'string',
          description: 'URL the customer is redirected to after leaving the portal.',
        },
        configuration: {
          type: 'string',
          description: 'ID of a portal configuration to use. If omitted, the default configuration is used.',
        },
        flow_data: {
          type: 'object',
          description: 'Deep-link flow config (e.g. { type: "subscription_cancel", subscription_cancel: { subscription: "sub_..." } }). See Stripe portal deep-links docs.',
        },
      },
      required: ['customer'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.billingPortal.sessions.create(
        buildStripeParams<Stripe.BillingPortal.SessionCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
