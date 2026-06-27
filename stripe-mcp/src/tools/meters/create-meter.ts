import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  display_name: z
    .string()
    .min(1)
    .describe('Human-readable name of the meter (e.g. "API Calls"). Not visible to customers.'),
  event_name: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, 'event_name must be snake_case (lowercase letters, digits, underscores)')
    .describe('The meter event name in snake_case (e.g. "api_calls"). Meter events use this to record usage.'),
  default_aggregation: z
    .object({
      formula: z
        .enum(['sum', 'count', 'last'])
        .describe('How meter events are aggregated: "sum" (total value), "count" (number of events), or "last" (most recent value).'),
    })
    .describe('Default aggregation settings for the meter.'),
  customer_mapping: z
    .object({
      event_payload_key: z
        .string()
        .min(1)
        .describe('Key in the meter event payload that identifies the customer (e.g. "stripe_customer_id").'),
      type: z
        .literal('by_id')
        .describe('Mapping type — Stripe only supports "by_id" (customer ID lookup).'),
    })
    .optional()
    .describe('How meter events map to a customer. If omitted, events must include a customer ID at the default key.'),
  value_settings: z
    .object({
      event_payload_key: z
        .string()
        .min(1)
        .describe('Key in the meter event payload to use as the numeric value (e.g. "bytes_used").'),
    })
    .optional()
    .describe('For "sum"/"last" formulas: which event payload key holds the numeric value.'),
  event_time_window: z
    .enum(['day', 'hour'])
    .optional()
    .describe('Pre-aggregation time window for meter events. Omit for no pre-aggregation.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_meters_create',
    description:
      'Create a billing meter for usage-based pricing. Meters aggregate usage events (e.g. API calls, bytes transferred) that can be attached to prices for metered billing. The event_name is in snake_case and is used when recording meter events.',
    inputSchema: {
      type: 'object',
      properties: {
        display_name: { type: 'string', description: 'Human-readable meter name.' },
        event_name: {
          type: 'string',
          description: 'Snake_case event name (e.g. "api_calls").',
        },
        default_aggregation: {
          type: 'object',
          properties: {
            formula: { type: 'string', enum: ['sum', 'count', 'last'], description: 'Aggregation formula.' },
          },
          required: ['formula'],
          description: 'Default aggregation settings.',
        },
        customer_mapping: {
          type: 'object',
          properties: {
            event_payload_key: { type: 'string', description: 'Payload key for customer ID.' },
            type: { type: 'string', enum: ['by_id'], description: 'Mapping type (Stripe only supports by_id).' },
          },
          required: ['event_payload_key', 'type'],
          description: 'How events map to a customer.',
        },
        value_settings: {
          type: 'object',
          properties: {
            event_payload_key: { type: 'string', description: 'Payload key for the numeric value.' },
          },
          required: ['event_payload_key'],
          description: 'For sum/last formulas: the value payload key.',
        },
        event_time_window: { type: 'string', enum: ['day', 'hour'], description: 'Pre-aggregation window.' },
      },
      required: ['display_name', 'event_name', 'default_aggregation'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const params = buildStripeParams<Stripe.Billing.MeterCreateParams>({
        display_name: parsed.data.display_name,
        event_name: parsed.data.event_name,
        default_aggregation: parsed.data.default_aggregation,
        customer_mapping: parsed.data.customer_mapping,
        value_settings: parsed.data.value_settings,
        event_time_window: parsed.data.event_time_window,
      });
      const meter = await stripe.billing.meters.create(params);
      return JSON.stringify(meter, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
