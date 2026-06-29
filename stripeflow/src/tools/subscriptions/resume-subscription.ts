import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  subscription_id: z
    .string()
    .describe('ID of the paused subscription to resume (sub_...).'),
  billing_cycle_anchor: z
    .enum(['now', 'unchanged'])
    .optional()
    .describe('Whether to reset the billing cycle anchor when resuming. Defaults to now.'),
  proration_behavior: z
    .enum(['none', 'create_prorations', 'always_invoice'])
    .optional()
    .describe('How to handle prorations when resuming. Defaults to create_prorations.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["latest_invoice"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_resume',
    description: `Resume a paused subscription.

Use this when:
- A customer returns from a paused state
- The \`resumes_at\` time arrives and you want to resume early
- Re-activating after a billing holiday

Only available for subscriptions using \`charge_automatically\` collection.
Returns: the resumed Stripe Subscription object (status: 'active').
Stripe docs: https://stripe.com/docs/api/subscriptions/resume`,
    inputSchema: {
      type: 'object',
      properties: {
        subscription_id: {
          type: 'string',
          description: 'ID of the paused subscription to resume (sub_...).',
        },
        billing_cycle_anchor: {
          type: 'string',
          enum: ['now', 'unchanged'],
          description: 'Whether to reset the billing cycle anchor when resuming.',
        },
        proration_behavior: {
          type: 'string',
          enum: ['none', 'create_prorations', 'always_invoice'],
          description: 'How to handle prorations when resuming.',
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["latest_invoice"]).',
          items: { type: 'string' },
        },
      },
      required: ['subscription_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const { subscription_id, ...rest } = parsed.data;
      const result = await stripe.subscriptions.resume(
        subscription_id,
        buildStripeParams<Stripe.SubscriptionResumeParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
