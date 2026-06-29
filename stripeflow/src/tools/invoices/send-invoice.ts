import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  invoice_id: z
    .string()
    .describe('ID of the invoice to email (in_...). Must be in open status with collection_method=send_invoice.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_send',
    description: `Email an invoice to the customer.

Use this when:
- The invoice uses \`send_invoice\` collection method and you want to email it
- Re-sending a reminder to the customer
- Manually triggering invoice delivery outside the auto-advance flow

Returns: the Stripe Invoice object (sent to the customer email on file).
Stripe docs: https://stripe.com/docs/api/invoices/send`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'ID of the invoice to email (in_...).',
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
      const result = await stripe.invoices.sendInvoice(
        invoice_id,
        buildStripeParams<Stripe.InvoiceSendInvoiceParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
