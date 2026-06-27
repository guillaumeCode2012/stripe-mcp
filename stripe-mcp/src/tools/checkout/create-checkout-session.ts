import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  success_url: z
    .string()
    .min(1)
    .describe('URL customers are redirected to after successful payment. Use {CHECKOUT_SESSION_ID} as a placeholder.'),
  cancel_url: z
    .string()
    .min(1)
    .describe('URL customers are redirected to if they cancel checkout.'),
  mode: z
    .enum(['payment', 'setup', 'subscription'])
    .optional()
    .describe('Checkout mode. "payment" for one-time, "subscription" for recurring, "setup" for saving a method off-session.'),
  line_items: z
    .array(
      z.object({
        price: z.string().min(1).describe('The ID of the Price object to charge.'),
        quantity: z.number().int().min(1).describe('Quantity of this line item.'),
      }),
    )
    .optional()
    .describe('Line items to purchase. Required in payment and subscription modes.'),
  payment_method_types: z
    .array(z.string())
    .optional()
    .describe('Payment method types to accept (e.g. ["card", "cashapp"]). Omit to use dashboard defaults.'),
  customer: z
    .string()
    .optional()
    .describe('Existing customer ID to associate with this checkout session.'),
  customer_email: z
    .string()
    .optional()
    .describe('Email to prefill for new customers (ignored if customer is set).'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata attached to the session.'),
  allow_promotion_codes: z
    .boolean()
    .optional()
    .describe('If true, customers can redeem promotion codes at checkout.'),
  billing_address_collection: z
    .enum(['auto', 'required'])
    .optional()
    .describe('Whether to collect the customer billing address. Defaults to "auto".'),
  tax_id_collection: z
    .object({
      enabled: z.boolean().describe('Set true to collect tax IDs at checkout.'),
    })
    .optional()
    .describe('Collect customer tax IDs during checkout.'),
  automatic_tax: z
    .object({
      enabled: z.boolean().describe('Set true to enable Stripe Tax automatic calculation.'),
    })
    .optional()
    .describe('Enable automatic tax calculation based on customer location.'),
  subscription_data: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Subscription-mode settings (e.g. { trial_period_days: 14, metadata: {...} }). See Stripe docs.'),
  payment_intent_data: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Payment-mode PaymentIntent settings (e.g. { description, statement_descriptor, capture_method }). See Stripe docs.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_checkout_create_session',
    description: `Create a Checkout Session for a one-time payment, subscription, or payment-method setup.

Use this when:
- you need a hosted Stripe Checkout URL to send to a customer
- you are building a "pay now" flow without a custom UI
- you want to start a subscription through hosted checkout

Returns: the full Stripe Checkout Session object (id, url, payment_intent, mode, status).
Stripe docs: https://stripe.com/docs/api/checkout/sessions/create`,
    inputSchema: {
      type: 'object',
      properties: {
        success_url: {
          type: 'string',
          description: 'URL customers are redirected to after successful payment. Use {CHECKOUT_SESSION_ID} as a placeholder.',
        },
        cancel_url: {
          type: 'string',
          description: 'URL customers are redirected to if they cancel checkout.',
        },
        mode: {
          type: 'string',
          enum: ['payment', 'setup', 'subscription'],
          description: 'Checkout mode. "payment" for one-time, "subscription" for recurring, "setup" for saving a method off-session.',
        },
        line_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              price: { type: 'string', description: 'The ID of the Price object to charge.' },
              quantity: { type: 'integer', minimum: 1, description: 'Quantity of this line item.' },
            },
            required: ['price', 'quantity'],
          },
          description: 'Line items to purchase. Required in payment and subscription modes.',
        },
        payment_method_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Payment method types to accept (e.g. ["card", "cashapp"]). Omit to use dashboard defaults.',
        },
        customer: {
          type: 'string',
          description: 'Existing customer ID to associate with this checkout session.',
        },
        customer_email: {
          type: 'string',
          description: 'Email to prefill for new customers (ignored if customer is set).',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata attached to the session.',
        },
        allow_promotion_codes: {
          type: 'boolean',
          description: 'If true, customers can redeem promotion codes at checkout.',
        },
        billing_address_collection: {
          type: 'string',
          enum: ['auto', 'required'],
          description: 'Whether to collect the customer billing address. Defaults to "auto".',
        },
        tax_id_collection: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', description: 'Set true to collect tax IDs at checkout.' },
          },
          description: 'Collect customer tax IDs during checkout.',
        },
        automatic_tax: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', description: 'Set true to enable Stripe Tax automatic calculation.' },
          },
          description: 'Enable automatic tax calculation based on customer location.',
        },
        subscription_data: {
          type: 'object',
          description: 'Subscription-mode settings (e.g. { trial_period_days: 14, metadata: {...} }). See Stripe docs.',
        },
        payment_intent_data: {
          type: 'object',
          description: 'Payment-mode PaymentIntent settings (e.g. { description, statement_descriptor, capture_method }). See Stripe docs.',
        },
      },
      required: ['success_url', 'cancel_url'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.checkout.sessions.create(
        buildStripeParams<Stripe.Checkout.SessionCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
