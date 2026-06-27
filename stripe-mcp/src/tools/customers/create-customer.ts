import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';

const addressSchema = z
  .object({
    line1: z.string().optional().describe('First line of the address'),
    line2: z.string().optional().describe('Second line of the address'),
    city: z.string().optional().describe('City, district, or suburb'),
    state: z.string().optional().describe('State, county, or province'),
    postal_code: z.string().optional().describe('ZIP or postal code'),
    country: z.string().optional().describe('Two-letter ISO country code (e.g. "US")'),
  })
  .describe('Customer billing address');

const shippingSchema = z
  .object({
    name: z.string().describe('Recipient name'),
    phone: z.string().optional().describe('Recipient phone number'),
    address: addressSchema.describe('Shipping address'),
  })
  .describe('Customer shipping information');

const inputSchema = z.object({
  email: z.string().email().optional().describe('Customer email address'),
  name: z.string().optional().describe('Customer full name or business name'),
  phone: z.string().optional().describe('Customer phone number'),
  description: z.string().optional().describe('Internal description shown in the Stripe dashboard'),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe('Arbitrary key-value pairs attached to the customer (keys and values are strings)'),
  address: addressSchema.optional(),
  shipping: shippingSchema.optional(),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_customers_create',
    description: `Create a new customer in Stripe.

Use this when:
- A new user signs up and needs a Stripe customer record
- You need to create a customer before attaching a payment method or subscription

Returns: the created Stripe Customer object.
Stripe docs: https://stripe.com/docs/api/customers/create`,
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Customer email address' },
        name: { type: 'string', description: 'Customer full name or business name' },
        phone: { type: 'string', description: 'Customer phone number' },
        description: { type: 'string', description: 'Internal description shown in the Stripe dashboard' },
        metadata: {
          type: 'object',
          description: 'Arbitrary key-value pairs attached to the customer (keys and values are strings)',
          additionalProperties: { type: 'string' },
        },
        address: {
          type: 'object',
          description: 'Customer billing address',
          properties: {
            line1: { type: 'string', description: 'First line of the address' },
            line2: { type: 'string', description: 'Second line of the address' },
            city: { type: 'string', description: 'City, district, or suburb' },
            state: { type: 'string', description: 'State, county, or province' },
            postal_code: { type: 'string', description: 'ZIP or postal code' },
            country: { type: 'string', description: 'Two-letter ISO country code (e.g. "US")' },
          },
          required: [],
        },
        shipping: {
          type: 'object',
          description: 'Customer shipping information',
          properties: {
            name: { type: 'string', description: 'Recipient name' },
            phone: { type: 'string', description: 'Recipient phone number' },
            address: {
              type: 'object',
              description: 'Shipping address',
              properties: {
                line1: { type: 'string', description: 'First line of the address' },
                line2: { type: 'string', description: 'Second line of the address' },
                city: { type: 'string', description: 'City, district, or suburb' },
                state: { type: 'string', description: 'State, county, or province' },
                postal_code: { type: 'string', description: 'ZIP or postal code' },
                country: { type: 'string', description: 'Two-letter ISO country code (e.g. "US")' },
              },
              required: [],
            },
          },
          required: ['name', 'address'],
        },
      },
      required: [],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.customers.create(
        buildStripeParams<Stripe.CustomerCreateParams>(parsed.data),
      );
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
