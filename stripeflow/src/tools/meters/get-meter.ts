import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  meter_id: z
    .string()
    .min(1)
    .describe('The ID of the billing meter to retrieve (e.g. "meter_...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_meters_get',
    description:
      'Retrieve a billing meter by ID. Returns the full meter object including display_name, event_name, default_aggregation, status, and customer_mapping.',
    inputSchema: {
      type: 'object',
      properties: {
        meter_id: { type: 'string', description: 'The meter ID (e.g. "meter_...").' },
      },
      required: ['meter_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const meter = await stripe.billing.meters.retrieve(parsed.data.meter_id);
      return JSON.stringify(meter, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
