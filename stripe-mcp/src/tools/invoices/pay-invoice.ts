import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  invoice_id: z
    .string()
    .describe('ID of the invoice to pay (in_...). Must be in draft or open status.'),
  paid_out_of_band: z
    .boolean()
    .optional()
    .describe(
      'If true, mark the invoice as paid without charging through Stripe (e.g. cash, wire). Defaults to false.',
    ),
  source: z
    .string()
    .optional()
    .describe('ID of a payment source (card_..., src_..., etc.) to charge. Must belong to the invoice customer.'),
  payment_method: z
    .string()
    .optional()
    .describe('ID of a PaymentMethod (pm_...) to charge. Must belong to the invoice customer.'),
  mandate: z
    .string()
    .optional()
    .describe('ID of a Mandate to use for this payment. Must correspond to the payment method.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["payment_intent"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_pay',
    description: `Pay an invoice (draft or open) immediately.

Use this when:
- A customer clicks "Pay now" on an open invoice
- You need to advance an invoice to paid status outside the normal billing cycle
- Marking an invoice as paid out-of-band (cash, check, wire transfer)

Returns: the Stripe Invoice object after payment is attempted (status: 'paid' or 'open').
Stripe docs: https://stripe.com/docs/api/invoices/pay`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'ID of the invoice to pay (in_...).',
        },
        paid_out_of_band: {
          type: 'boolean',
          description: 'If true, mark as paid without charging through Stripe.',
        },
        source: {
          type: 'string',
          description: 'ID of a payment source (card_..., src_...) to charge.',
        },
        payment_method: {
          type: 'string',
          description: 'ID of a PaymentMethod (pm_...) to charge.',
        },
        mandate: {
          type: 'string',
          description: 'ID of a Mandate to use for this payment.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["payment_intent"]).',
          items: { type: 'string' },
        },
      },
      required: ['invoice_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { invoice_id, ...rest } = parsed.data;
      const result = await stripe.invoices.pay(
        invoice_id,
        buildStripeParams<Stripe.InvoicePayParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
