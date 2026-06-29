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
    .describe('Display name of the tax rate, shown to users (e.g. "Sales Tax", "VAT").'),
  percentage: z
    .number()
    .min(0)
    .max(100)
    .describe('Tax rate percentage out of 100 (e.g. 8.5 for 8.5%).'),
  inclusive: z
    .boolean()
    .describe('Whether the tax is inclusive (already in the listed price) or exclusive (added at checkout).'),
  description: z
    .string()
    .optional()
    .describe('Internal description of the tax rate. Not shown to customers.'),
  jurisdiction: z
    .string()
    .optional()
    .describe('Jurisdiction label (e.g. "US-CA", "EU"). Appears on customer invoices.'),
  active: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether the tax rate is active. Defaults to true.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Key-value pairs for internal use.'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_tax_create_rate',
    description:
      'Create a manual tax rate with a display name, percentage, and inclusive/exclusive flag. Use this for jurisdictions not covered by Stripe Tax automatic calculation.',
    inputSchema: {
      type: 'object',
      properties: {
        display_name: { type: 'string', description: 'Display name (e.g. "Sales Tax").' },
        percentage: { type: 'number', minimum: 0, maximum: 100, description: 'Percentage out of 100.' },
        inclusive: { type: 'boolean', description: 'Inclusive (true) or exclusive (false).' },
        description: { type: 'string', description: 'Internal description.' },
        jurisdiction: { type: 'string', description: 'Jurisdiction label (e.g. "US-CA").' },
        active: { type: 'boolean', default: true, description: 'Active flag (default true).' },
        metadata: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Key-value pairs.',
        },
      },
      required: ['display_name', 'percentage', 'inclusive'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const params = buildStripeParams<Stripe.TaxRateCreateParams>({
        display_name: parsed.data.display_name,
        percentage: parsed.data.percentage,
        inclusive: parsed.data.inclusive,
        description: parsed.data.description,
        jurisdiction: parsed.data.jurisdiction,
        active: parsed.data.active,
        metadata: parsed.data.metadata,
      });
      const taxRate = await stripe.taxRates.create(params);
      return JSON.stringify(taxRate, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
