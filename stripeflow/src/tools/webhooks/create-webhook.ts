import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  url: z.string().url().describe('HTTPS URL of the webhook endpoint to receive events'),
  enabled_events: z
    .array(z.string())
    .min(1)
    .describe('List of event types to subscribe to (e.g. ["charge.succeeded", "invoice.paid"])'),
  description: z.string().optional().describe('Optional description for the webhook endpoint'),
  metadata: z.record(z.string(), z.string()).optional().describe('Set of key-value pairs to attach to the object'),
  api_version: z.string().optional().describe('Stripe API version the endpoint should use (e.g. 2024-12-18.acacia)'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_webhooks_create',
    description: `Create a webhook endpoint to receive Stripe event notifications.

Use this when:
- You want to be notified of events like charge.succeeded or invoice.paid
- You are configuring a new backend service to react to Stripe events

Returns: the created Stripe WebhookEndpoint object (includes a signing secret).
Stripe docs: https://stripe.com/docs/api/webhook_endpoints/create`,
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'HTTPS URL of the webhook endpoint to receive events' },
        enabled_events: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of event types to subscribe to (e.g. ["charge.succeeded", "invoice.paid"])',
        },
        description: { type: 'string', description: 'Optional description for the webhook endpoint' },
        metadata: { type: 'object', description: 'Set of key-value pairs to attach to the object' },
        api_version: {
          type: 'string',
          description: 'Stripe API version the endpoint should use (e.g. 2024-12-18.acacia)',
        },
      },
      required: ['url', 'enabled_events'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.webhookEndpoints.create(
        buildStripeParams<Stripe.WebhookEndpointCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
