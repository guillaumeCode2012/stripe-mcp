import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  subscription_id: z
    .string()
    .describe('ID of the subscription to cancel (sub_...).'),
  prorate: z
    .boolean()
    .optional()
    .describe('If true, generate a proration invoice item for unused time. Defaults to false.'),
  invoice_now: z
    .boolean()
    .optional()
    .describe('If true, generate a final invoice for un-invoiced metered usage and prorations. Defaults to false.'),
  cancellation_details: z
    .object({
      comment: z
        .string()
        .optional()
        .describe('Free-text reason for the cancellation (maps to Stripe cancellation_details.comment).'),
      feedback: z
        .enum([
          'customer_service',
          'low_quality',
          'missing_features',
          'other',
          'switched_service',
          'too_complex',
          'too_expensive',
          'unused',
        ])
        .optional()
        .describe('Customer-submitted cancellation feedback reason.'),
    })
    .optional()
    .describe('Details about why the subscription was cancelled.'),
  expand: z
    .array(z.string())
    .optional()
    .describe('Stripe expandable fields (e.g. ["customer"]).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_subscriptions_cancel',
    description: `Cancel a subscription immediately.

Use this when:
- A customer churns and you want to stop billing now
- The customer requests immediate cancellation
- You need to halt recurring billing on a disputed subscription

Returns: the cancelled Stripe Subscription object (status: 'canceled').
Stripe docs: https://stripe.com/docs/api/subscriptions/cancel`,
    inputSchema: {
      type: 'object',
      properties: {
        subscription_id: {
          type: 'string',
          description: 'ID of the subscription to cancel (sub_...).',
        },
        prorate: {
          type: 'boolean',
          description: 'If true, generate a proration invoice item for unused time.',
        },
        invoice_now: {
          type: 'boolean',
          description: 'If true, generate a final invoice for un-invoiced metered usage.',
        },
        cancellation_details: {
          type: 'object',
          description: 'Details about why the subscription was cancelled.',
          properties: {
            comment: {
              type: 'string',
              description: 'Free-text reason for the cancellation.',
            },
            feedback: {
              type: 'string',
              enum: [
                'customer_service',
                'low_quality',
                'missing_features',
                'other',
                'switched_service',
                'too_complex',
                'too_expensive',
                'unused',
              ],
              description: 'Customer-submitted cancellation feedback reason.',
            },
          },
        },
        expand: {
          type: 'array',
          description: 'Stripe expandable fields (e.g. ["customer"]).',
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
      const result = await stripe.subscriptions.cancel(
        subscription_id,
        buildStripeParams<Stripe.SubscriptionCancelParams>(rest),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
