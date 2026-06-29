import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      'Stripe search query string. Example: `email:\'foo@bar.com\'` or `name:\'Acme Corp\'`. See https://stripe.com/docs/search#search-query-language and query fields for customers at https://stripe.com/docs/search#query-fields-for-customers.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Maximum number of results to return (1-100, default 10).'),
  page: z
    .string()
    .optional()
    .describe('Cursor for next page of search results (use next_page value from a prior response).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_search',
    description: `Search Stripe customers using the Stripe Search API.

Use this when:
- You need to find customers by partial matches on name, email, phone, etc.
- The list endpoint's exact-match filters are not flexible enough

The Stripe Search API supports a query language. See:
- Query language: https://stripe.com/docs/search#search-query-language
- Queryable fields for customers: https://stripe.com/docs/search#query-fields-for-customers

Note: search results are eventually consistent; very recently created customers may not appear immediately.

Returns: a Stripe SearchResult envelope with \`data\` (array of Customer), \`has_more\`, and \`next_page\`.
Stripe docs: https://stripe.com/docs/api/customers/search`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Stripe search query string. Example: `email:\'foo@bar.com\'` or `name:\'Acme Corp\'`. See https://stripe.com/docs/search#search-query-language and query fields for customers at https://stripe.com/docs/search#query-fields-for-customers.',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Maximum number of results to return (1-100, default 10).',
        },
        page: {
          type: 'string',
          description:
            'Cursor for next page of search results (use next_page value from a prior response).',
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
      const result = await stripe.customers.search(
        buildStripeParams<Stripe.CustomerSearchParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
