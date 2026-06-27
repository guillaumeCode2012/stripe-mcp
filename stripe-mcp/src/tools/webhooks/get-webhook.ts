import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  webhook_id: z.string().describe('ID of the webhook endpoint to retrieve (e.g. we_1abc23)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_webhooks_get',
    description: `Retrieve a single webhook endpoint by ID.

Use this when:
- You want to inspect a webhook endpoint configuration
- You need to verify which events a webhook is subscribed to

Returns: the Stripe WebhookEndpoint object.
Stripe docs: https://stripe.com/docs/api/webhook_endpoints/retrieve`,
    inputSchema: {
      type: 'object',
      properties: {
        webhook_id: { type: 'string', description: 'ID of the webhook endpoint to retrieve (e.g. we_1abc23)' },
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
      const result = await stripe.webhookEndpoints.retrieve(
        parsed.data.webhook_id,
        buildStripeParams<Stripe.WebhookEndpointRetrieveParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
