import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  webhook_id: z.string().describe('ID of the webhook endpoint to update (e.g. we_1abc23)'),
  url: z.string().url().optional().describe('New HTTPS URL for the webhook endpoint'),
  enabled_events: z
    .array(z.string())
    .optional()
    .describe('New list of event types to subscribe to'),
  description: z.string().optional().describe('Optional description for the webhook endpoint'),
  metadata: z.record(z.string(), z.string()).optional().describe('Set of key-value pairs to attach to the object'),
  disabled: z.boolean().optional().describe('If true, the endpoint is disabled and will not receive events'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_webhooks_update',
    description: `Update a webhook endpoint (URL, events, description, enabled state, metadata).

Use this when:
- Your webhook receiver URL has changed
- You want to add or remove subscribed events
- You need to temporarily disable an endpoint

Returns: the updated Stripe WebhookEndpoint object.
Stripe docs: https://stripe.com/docs/api/webhook_endpoints/update`,
    inputSchema: {
      type: 'object',
      properties: {
        webhook_id: { type: 'string', description: 'ID of the webhook endpoint to update (e.g. we_1abc23)' },
        url: { type: 'string', description: 'New HTTPS URL for the webhook endpoint' },
        enabled_events: { type: 'array', items: { type: 'string' }, description: 'New list of event types to subscribe to' },
        description: { type: 'string', description: 'Optional description for the webhook endpoint' },
        metadata: { type: 'object', description: 'Set of key-value pairs to attach to the object' },
        disabled: { type: 'boolean', description: 'If true, the endpoint is disabled and will not receive events' },
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
      const result = await stripe.webhookEndpoints.update(
        parsed.data.webhook_id,
        buildStripeParams<Stripe.WebhookEndpointUpdateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
