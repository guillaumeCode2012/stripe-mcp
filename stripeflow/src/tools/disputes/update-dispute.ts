import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  dispute_id: z.string().describe('ID of the dispute to update (e.g. dp_1abc23)'),
  evidence: z
    .record(z.string(), z.string())
    .optional()
    .describe('Key-value map of evidence fields (e.g. access_activity_log, billing_address)'),
  submit: z.boolean().optional().describe('Whether to submit evidence immediately (closes the dispute)'),
  metadata: z.record(z.string(), z.string()).optional().describe('Set of key-value pairs to attach to the object'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_disputes_update',
    description: `Update a dispute with evidence or metadata, optionally submitting it.

Use this when:
- You are responding to a chargeback with evidence
- You want to attach metadata to track dispute status internally

Returns: the updated Stripe Dispute object.
Stripe docs: https://stripe.com/docs/api/disputes/update`,
    inputSchema: {
      type: 'object',
      properties: {
        dispute_id: { type: 'string', description: 'ID of the dispute to update (e.g. dp_1abc23)' },
        evidence: {
          type: 'object',
          description: 'Key-value map of evidence fields (e.g. access_activity_log, billing_address)',
        },
        submit: { type: 'boolean', description: 'Whether to submit evidence immediately (closes the dispute)' },
        metadata: { type: 'object', description: 'Set of key-value pairs to attach to the object' },
      },
      required: ['dispute_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.disputes.update(
        parsed.data.dispute_id,
        buildStripeParams<Stripe.DisputeUpdateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
