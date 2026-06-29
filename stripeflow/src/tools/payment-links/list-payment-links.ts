import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: an existing payment link ID to start pagination after.'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on the total number of payment links returned (defaults to 100,000 if omitted).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_links_list',
    description: `List all payment links in the account, auto-paginating through every page.

Use this when:
- you need an inventory of all hosted checkout links
- you are auditing which links are active vs. deactivated
- you want to bulk-export links for reporting

Returns: \`{ total_count, has_more, data: PaymentLink[] }\` with all links up to max_items.
Stripe docs: https://stripe.com/docs/api/payment_links/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: an existing payment link ID to start pagination after.',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Hard cap on the total number of payment links returned (defaults to 100,000 if omitted).',
        },
      },
      required: [],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { limit, starting_after, max_items } = parsed.data;
      const maxItems = max_items ?? limit;
      let firstCall = true;
      const items = await paginateAll<Stripe.PaymentLink>(
        (p) => {
          const sa = firstCall ? starting_after : p.starting_after;
          firstCall = false;
          return stripe.paymentLinks.list(
            buildStripeParams<Stripe.PaymentLinkListParams>({
              limit: p.limit,
              ...(sa ? { starting_after: sa } : {}),
            }),
          );
        },
        maxItems ? { maxItems } : undefined,
      );
      return JSON.stringify(listEnvelope(items), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
