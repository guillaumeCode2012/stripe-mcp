import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  invoice_id: z
    .string()
    .describe('ID of the invoice to void (in_...). Must be in open status.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_void',
    description: `Mark an open invoice as void.

Use this when:
- An invoice was issued in error and the customer should never be charged
- A disputed charge results in cancellation of the invoice
- You need to cleanly cancel an invoice without deleting it (for audit trail)

Voiding is irreversible. The invoice remains visible but is no longer payable.
Returns: the Stripe Invoice object (status: 'void').
Stripe docs: https://stripe.com/docs/api/invoices/void`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'ID of the invoice to void (in_...). Must be in open status.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["customer"]).',
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
      const result = await stripe.invoices.voidInvoice(
        invoice_id,
        buildStripeParams<Stripe.InvoiceVoidInvoiceParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
