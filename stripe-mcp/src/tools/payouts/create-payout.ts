import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe('Positive integer in cents (or local equivalent) representing how much to payout.'),
  currency: z
    .string()
    .min(3)
    .max(3)
    .describe('Three-letter ISO currency code, in lowercase (e.g. "usd", "eur").'),
  destination: z
    .string()
    .optional()
    .describe('ID of a bank account or card to send the payout to. If omitted, Stripe uses the default external account for the currency.'),
  method: z
    .enum(['standard', 'instant'])
    .optional()
    .describe('Payout method: "standard" (1-2 business days) or "instant" (minutes, supported in certain countries).'),
  statement_descriptor: z
    .string()
    .max(22)
    .optional()
    .describe('String that displays on the recipient bank/card statement (up to 22 characters).'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Set of key-value pairs attached to the payout for your internal use.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payouts_create',
    description:
      'Create an outgoing payout to a bank account or debit card. Use this to manually withdraw funds from your Stripe available balance. Returns the created payout object.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'integer',
          minimum: 1,
          description: 'Positive integer in cents (or local equivalent) representing how much to payout.',
        },
        currency: { type: 'string', description: 'Three-letter ISO currency code, lowercase (e.g. "usd").' },
        destination: { type: 'string', description: 'Bank account or card ID to send the payout to.' },
        method: { type: 'string', enum: ['standard', 'instant'], description: 'Payout method.' },
        statement_descriptor: { type: 'string', description: 'Statement descriptor (max 22 chars).' },
        metadata: {
          type: 'object',
          description: 'Key-value pairs for internal use.',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['amount', 'currency'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const params = buildStripeParams<Stripe.PayoutCreateParams>({
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        destination: parsed.data.destination,
        method: parsed.data.method,
        statement_descriptor: parsed.data.statement_descriptor,
        metadata: parsed.data.metadata,
      });
      const payout = await stripe.payouts.create(params);
      return JSON.stringify(payout, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
