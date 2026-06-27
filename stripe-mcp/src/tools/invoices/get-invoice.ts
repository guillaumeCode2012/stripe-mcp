import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  invoice_id: z
    .string()
    .describe('ID of the invoice to retrieve (in_...).'),
  expand: z
    .array(z.string())
    .optional()
    .describe(
      'Stripe expandable fields (e.g. ["customer","subscription","payment_intent","lines.data.price"]).',
    ),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_get',
    description: `Retrieve an invoice by ID.

Use this when:
- Inspecting a single invoice's line items, totals, or status
- Confirming an invoice was paid before granting access
- Showing a customer their invoice history detail

Returns: the Stripe Invoice object.
Stripe docs: https://stripe.com/docs/api/invoices/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'ID of the invoice to retrieve (in_...).',
        },
        expand: {
          type: 'array',
          description:
            'Stripe expandable fields (e.g. ["customer","subscription","payment_intent"]).',
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
      const result = await stripe.invoices.retrieve(
        parsed.data.invoice_id,
        buildStripeParams<Stripe.InvoiceRetrieveParams>({
          expand: parsed.data.expand,
        }),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
