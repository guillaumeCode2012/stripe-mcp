import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const inputSchema = z.object({
  line_items: z
    .array(
      z.object({
        price: z.string().min(1).describe('The ID of the Price object to sell.'),
        quantity: z.number().int().min(1).describe('Quantity of this line item to purchase.'),
      }),
    )
    .min(1)
    .describe('Line items to sell through this payment link (up to 20).'),
  application_fee_amount: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Connect only: fee in cents to transfer to the platform account.'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value metadata copied to checkout sessions created by this link.'),
  allow_promotion_codes: z
    .boolean()
    .optional()
    .describe('If true, customers can redeem promotion codes at checkout.'),
  automatic_tax: z
    .object({
      enabled: z.boolean().describe('Set true to enable Stripe Tax automatic calculation.'),
    })
    .optional()
    .describe('Enable automatic tax calculation based on customer location.'),
  tax_id_collection: z
    .object({
      enabled: z.boolean().describe('Set true to collect tax IDs at checkout.'),
    })
    .optional()
    .describe('Collect customer tax IDs during checkout.'),
  billing_address_collection: z
    .enum(['auto', 'required'])
    .optional()
    .describe('Whether to collect the customer billing address. Defaults to "auto".'),
  customer_creation: z
    .enum(['always', 'if_required'])
    .optional()
    .describe('When checkout sessions create a Customer object (payment mode only).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_payment_links_create',
    description: `Create a hosted Payment Link that customers can visit to purchase one or more products.

Use this when:
- you need a shareable URL for a product (e.g. for email, social, QR codes)
- you want to sell without building a custom checkout
- you are setting up a no-code storefront

Returns: the full Stripe PaymentLink object (id, url, line_items, active).
Stripe docs: https://stripe.com/docs/api/payment_links/create`,
    inputSchema: {
      type: 'object',
      properties: {
        line_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              price: { type: 'string', description: 'The ID of the Price object to sell.' },
              quantity: { type: 'integer', minimum: 1, description: 'Quantity of this line item to purchase.' },
            },
            required: ['price', 'quantity'],
          },
          description: 'Line items to sell through this payment link (up to 20).',
        },
        application_fee_amount: {
          type: 'integer',
          minimum: 0,
          description: 'Connect only: fee in cents to transfer to the platform account.',
        },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value metadata copied to checkout sessions created by this link.',
        },
        allow_promotion_codes: {
          type: 'boolean',
          description: 'If true, customers can redeem promotion codes at checkout.',
        },
        automatic_tax: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', description: 'Set true to enable Stripe Tax automatic calculation.' },
          },
          description: 'Enable automatic tax calculation based on customer location.',
        },
        tax_id_collection: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', description: 'Set true to collect tax IDs at checkout.' },
          },
          description: 'Collect customer tax IDs during checkout.',
        },
        billing_address_collection: {
          type: 'string',
          enum: ['auto', 'required'],
          description: 'Whether to collect the customer billing address. Defaults to "auto".',
        },
        customer_creation: {
          type: 'string',
          enum: ['always', 'if_required'],
          description: 'When checkout sessions create a Customer object (payment mode only).',
        },
      },
      required: ['line_items'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.paymentLinks.create(
        buildStripeParams<Stripe.PaymentLinkCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
