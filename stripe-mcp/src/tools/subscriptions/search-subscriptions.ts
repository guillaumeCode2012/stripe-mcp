import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  query: z
    .string()
    .describe(
      'Stripe Search Query Language string. Supported fields: status, customer, plan.id, price.id, metadata.<key>. Examples: "status:\'active\'", "customer:\'cus_abc\' AND metadata.order_id:\'42\'".',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Maximum number of results (1-100). Defaults to 10.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["data.customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_search',
    description: `Search subscriptions using Stripe Search Query Language.

Use this when:
- Looking up subscriptions by metadata, status, or plan attributes
- Building dashboard-style filtered views
- Finding subscriptions matching a complex boolean query

Search results are eventually consistent (not for read-after-write flows).
Returns: \`{ total_count, has_more, data }\` envelope.
Stripe docs: https://stripe.com/docs/api/subscriptions/search`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Stripe Search Query Language string. Supported fields: status, customer, plan.id, price.id, metadata.<key>.',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results (1-100). Defaults to 10.',
          minimum: 1,
          maximum: 100,
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["data.customer"]).',
          items: { type: 'string' },
        },
      },
      required: ['query'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { query, ...rest } = parsed.data;
      const result = await stripe.subscriptions.search(
        buildStripeParams<Stripe.SubscriptionSearchParams>({ query, ...rest }),
      );
      // Search results are paginated via `next_page`, not `has_more`. We return
      // the first page (Stripe's search limit is 100 per page). Auto-pagination
      // across search pages is intentionally omitted to keep search responsive.
      const data = result.data as Stripe.Subscription[];
      return JSON.stringify(
        { total_count: data.length, has_more: result.has_more, data },
        null,
        2,
      );
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
