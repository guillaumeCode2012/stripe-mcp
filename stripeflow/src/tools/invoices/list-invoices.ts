import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Page size for each Stripe request (1-100). Use max_items for total cap.'),
  customer: z
    .string()
    .optional()
    .describe('Only return invoices for this customer (cus_...).'),
  status: z
    .enum(['draft', 'open', 'paid', 'uncollectible', 'void'])
    .optional()
    .describe('Filter by invoice status. Stripe accepts: draft, open, paid, uncollectible, void.'),
  subscription: z
    .string()
    .optional()
    .describe('Only return invoices for this subscription (sub_...).'),
  starting_after: z
    .string()
    .optional()
    .describe('Pagination cursor — ID of the last object from the previous page (in_...).'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on total items returned. Defaults to 1000.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_invoices_list',
    description: `List invoices with optional filters.

Use this when:
- Showing a customer their invoice history
- Finding open or past-due invoices for collection workflows
- Auditing drafts before finalization

Auto-paginates through all matching invoices (capped by max_items).
Returns: \`{ total_count, has_more, data }\` envelope.
Stripe docs: https://stripe.com/docs/api/invoices/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Page size for each Stripe request (1-100).',
          minimum: 1,
          maximum: 100,
        },
        customer: {
          type: 'string',
          description: 'Only return invoices for this customer (cus_...).',
        },
        status: {
          type: 'string',
          enum: ['draft', 'open', 'paid', 'uncollectible', 'void'],
          description: 'Filter by invoice status.',
        },
        subscription: {
          type: 'string',
          description: 'Only return invoices for this subscription (sub_...).',
        },
        starting_after: {
          type: 'string',
          description: 'Pagination cursor — ID of the last object from the previous page.',
        },
        max_items: {
          type: 'integer',
          description: 'Hard cap on total items returned. Defaults to 1000.',
          minimum: 1,
        },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const all = await paginateAll<Stripe.Invoice>(
        (p) =>
          stripe.invoices.list({
            ...p,
            ...(parsed.data.customer ? { customer: parsed.data.customer } : {}),
            ...(parsed.data.status ? { status: parsed.data.status } : {}),
            ...(parsed.data.subscription ? { subscription: parsed.data.subscription } : {}),
          }),
        { maxItems: parsed.data.max_items ?? 1000 },
      );
      return JSON.stringify(
        { total_count: all.length, has_more: false, data: all },
        null,
        2,
      );
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
