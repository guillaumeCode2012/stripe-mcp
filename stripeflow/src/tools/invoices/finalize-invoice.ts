import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  invoice_id: z
    .string()
    .describe('ID of the draft invoice to finalize (in_...). Must be in draft status.'),
  auto_advance: z
    .boolean()
    .optional()
    .describe(
      'If true (default), Stripe auto-advances the invoice through the billing cycle. Set false to require manual advancement.',
    ),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["customer","payment_intent"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_finalize',
    description: `Finalize a draft invoice, advancing it to open status.

Use this when:
- You want to lock in line items and email the customer
- Triggering payment collection on a manually-created draft
- Converting a draft to an open invoice before charging

Returns: the Stripe Invoice object (status: 'open').
Stripe docs: https://stripe.com/docs/api/invoices/finalize`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'ID of the draft invoice to finalize (in_...).',
        },
        auto_advance: {
          type: 'boolean',
          description:
            'If true (default), Stripe auto-advances the invoice through the billing cycle.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["customer","payment_intent"]).',
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
      const result = await stripe.invoices.finalizeInvoice(
        invoice_id,
        buildStripeParams<Stripe.InvoiceFinalizeInvoiceParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
