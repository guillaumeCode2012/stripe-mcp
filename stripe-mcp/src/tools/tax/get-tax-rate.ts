import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  tax_rate_id: z
    .string()
    .min(1)
    .describe('The ID of the tax rate to retrieve (e.g. "txr_...").'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_tax_get_rate',
    description:
      'Retrieve the details of an existing tax rate by ID. Returns the full tax rate object including percentage, jurisdiction, and active flag.',
    inputSchema: {
      type: 'object',
      properties: {
        tax_rate_id: { type: 'string', description: 'The tax rate ID (e.g. "txr_...").' },
      },
      required: ['tax_rate_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const stripe = getStripeClient();
    try {
      const taxRate = await stripe.taxRates.retrieve(parsed.data.tax_rate_id);
      return JSON.stringify(taxRate, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
