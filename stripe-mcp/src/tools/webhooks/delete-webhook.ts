import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  webhook_id: z.string().describe('ID of the webhook endpoint to delete (e.g. we_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_webhooks_delete',
    description: `Permanently delete a webhook endpoint.

Use this when:
- The webhook receiver is decommissioned
- You want to stop all event delivery to a URL

Returns: the Stripe deletion response (\`{ id, deleted: true, object: 'webhook_endpoint' }\`).
Stripe docs: https://stripe.com/docs/api/webhook_endpoints/delete`,
    inputSchema: {
      type: 'object',
      properties: {
        webhook_id: { type: 'string', description: 'ID of the webhook endpoint to delete (e.g. we_1abc23)' },
      },
      required: ['webhook_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.webhookEndpoints.del(parsed.data.webhook_id);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
