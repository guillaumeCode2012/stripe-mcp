import { z } from 'zod';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';

const inputSchema = z.object({
  product_id: z
    .string()
    .min(1)
    .describe('Stripe product ID to archive (e.g. "prod_1a2b3c")'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_products_archive',
    description: `Archive a Stripe product by marking it inactive (\`active: false\`).

Use this when:
- A product is no longer sold but should remain in your historical records
- You want to hide a product from new checkouts without deleting it

Archiving (not deleting) is the Stripe-recommended way to retire a product, because existing subscriptions and invoices still reference it. The product can be reactivated later by updating \`active\` to \`true\`.

Returns: the updated Stripe Product object with \`active: false\`.
Stripe docs: https://stripe.com/docs/api/products/update`,
    inputSchema: {
      type: 'object',
      properties: {
        product_id: {
          type: 'string',
          description: 'Stripe product ID to archive (e.g. "prod_1a2b3c")',
        },
      },
      required: ['product_id'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return `Validation error: ${parsed.error.message}`;
    }
    const stripe = getStripeClient();
    try {
      const result = await stripe.products.update(parsed.data.product_id, { active: false });
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
