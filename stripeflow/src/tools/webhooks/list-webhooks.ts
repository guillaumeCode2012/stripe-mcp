import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().describe('Page size per request (max 100, default 100)'),
  starting_after: z.string().optional().describe('Cursor: ID of the object to start after'),
  max_items: z.number().int().min(1).optional().describe('Hard cap on total items to fetch across all pages'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_webhooks_list',
    description: `List webhook endpoints with auto-pagination.

Use this when:
- You want to audit existing webhook configurations
- You need to find a webhook by URL or event subscription

Returns: \`{ total_count, has_more, data }\` envelope of Stripe WebhookEndpoint objects.
Stripe docs: https://stripe.com/docs/api/webhook_endpoints/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Page size per request (max 100, default 100)' },
        starting_after: { type: 'string', description: 'Cursor: ID of the object to start after' },
        max_items: { type: 'integer', description: 'Hard cap on total items to fetch across all pages' },
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
      const listParams = buildStripeParams<Stripe.WebhookEndpointListParams>({
        limit: parsed.data.limit,
        starting_after: parsed.data.starting_after,
      });
      const data = await paginateAll<Stripe.WebhookEndpoint>(
        (p) => stripe.webhookEndpoints.list({ ...listParams, ...p }),
        parsed.data.max_items !== undefined ? { maxItems: parsed.data.max_items } : undefined,
      );
      return JSON.stringify(listEnvelope<Stripe.WebhookEndpoint>(data), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
