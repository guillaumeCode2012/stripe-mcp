import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  amount: z.number().int().min(1).describe('Amount in the smallest currency unit (e.g. cents)'),
  currency: z.string().describe('Three-letter ISO currency code, lowercase (e.g. usd)'),
  customer: z.string().optional().describe('ID of the customer to attach this PaymentIntent to'),
  description: z.string().optional().describe('Arbitrary description for the PaymentIntent'),
  metadata: z.record(z.string(), z.string()).optional().describe('Set of key-value pairs to attach to the object'),
  payment_method: z.string().optional().describe('ID of the payment method to use with this PaymentIntent'),
  confirm: z.boolean().optional().describe('If true, attempt to confirm the PaymentIntent immediately'),
  automatic_payment_methods: z
    .object({ enabled: z.boolean().describe('Enable automatic payment methods') })
    .optional()
    .describe('Configure automatic payment methods'),
  receipt_email: z.string().optional().describe('Email to send the receipt to'),
  statement_descriptor: z.string().optional().describe('Information about the charge for the customer\u2019s statement'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_intents_create',
    description: `Create a PaymentIntent to collect payment from a customer.

Use this when:
- You need to charge a customer a one-time amount
- You're building a custom checkout flow

Returns: the created Stripe PaymentIntent object (includes client_secret).
Stripe docs: https://stripe.com/docs/api/payment_intents/create`,
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'integer', description: 'Amount in the smallest currency unit (e.g. cents)' },
        currency: { type: 'string', description: 'Three-letter ISO currency code, lowercase (e.g. usd)' },
        customer: { type: 'string', description: 'ID of the customer to attach this PaymentIntent to' },
        description: { type: 'string', description: 'Arbitrary description for the PaymentIntent' },
        metadata: { type: 'object', description: 'Set of key-value pairs to attach to the object' },
        payment_method: { type: 'string', description: 'ID of the payment method to use with this PaymentIntent' },
        confirm: { type: 'boolean', description: 'If true, attempt to confirm the PaymentIntent immediately' },
        automatic_payment_methods: {
          type: 'object',
          description: 'Configure automatic payment methods',
          properties: { enabled: { type: 'boolean', description: 'Enable automatic payment methods' } },
        },
        receipt_email: { type: 'string', description: 'Email to send the receipt to' },
        statement_descriptor: {
          type: 'string',
          description: 'Information about the charge for the customer\u2019s statement',
        },
      },
      required: ['amount', 'currency'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.paymentIntents.create(
        buildStripeParams<Stripe.PaymentIntentCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
