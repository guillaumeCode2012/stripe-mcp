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
  status: z
    .enum(['open', 'complete', 'expired'])
    .optional()
    .describe('Filter by Checkout Session status.'),
  payment_link: z
    .string()
    .optional()
    .describe('Only return sessions created by this Payment Link ID.'),
  customer: z
    .string()
    .optional()
    .describe('Only return sessions for this Customer ID.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: an existing session ID to start pagination after.'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on the total number of sessions returned (defaults to 100,000 if omitted).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_checkout_list_sessions',
    description: `List Checkout Sessions, auto-paginating through every page.

Use this when:
- you need to find sessions by customer, status, or originating payment link
- you are reconciling abandoned vs. completed checkouts
- you want to export checkout activity for reporting

Returns: \`{ total_count, has_more, data: Session[] }\` with all matching sessions up to max_items.
Stripe docs: https://stripe.com/docs/api/checkout/sessions/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.',
        },
        status: {
          type: 'string',
          enum: ['open', 'complete', 'expired'],
          description: 'Filter by Checkout Session status.',
        },
        payment_link: {
          type: 'string',
          description: 'Only return sessions created by this Payment Link ID.',
        },
        customer: {
          type: 'string',
          description: 'Only return sessions for this Customer ID.',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: an existing session ID to start pagination after.',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Hard cap on the total number of sessions returned (defaults to 100,000 if omitted).',
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
      const { limit, starting_after, max_items, ...filters } = parsed.data;
      const maxItems = max_items ?? limit;
      let firstCall = true;
      const items = await paginateAll<Stripe.Checkout.Session>(
        (p) => {
          const sa = firstCall ? starting_after : p.starting_after;
          firstCall = false;
          return stripe.checkout.sessions.list(
            buildStripeParams<Stripe.Checkout.SessionListParams>({
              ...filters,
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
