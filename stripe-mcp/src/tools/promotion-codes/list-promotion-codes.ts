import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { buildStripeParams } from '../../utils/object.js';
import { paginateAll, listEnvelope } from '../../utils/pagination.js';

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.'),
  coupon: z
    .string()
    .optional()
    .describe('Only return promotion codes for this coupon ID.'),
  active: z
    .boolean()
    .optional()
    .describe('Filter by active state. true returns active codes, false returns inactive.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: an existing promotion code ID to start pagination after.'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on the total number of promotion codes returned (defaults to 100,000 if omitted).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_promotion_codes_list',
    description: `List promotion codes, auto-paginating through every page.

Use this when:
- you need to audit all redeemable codes for a campaign
- you want to filter codes by coupon or active state
- you are reporting on redemption counts across codes

Returns: \`{ total_count, has_more, data: PromotionCode[] }\` with all matching codes up to max_items.
Stripe docs: https://stripe.com/docs/api/promotion_codes/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.',
        },
        coupon: {
          type: 'string',
          description: 'Only return promotion codes for this coupon ID.',
        },
        active: {
          type: 'boolean',
          description: 'Filter by active state. true returns active codes, false returns inactive.',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: an existing promotion code ID to start pagination after.',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Hard cap on the total number of promotion codes returned (defaults to 100,000 if omitted).',
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
      const { limit, starting_after, max_items, ...filters } = parsed.data;
      const maxItems = max_items ?? limit;
      let firstCall = true;
      const items = await paginateAll<Stripe.PromotionCode>(
        (p) => {
          const sa = firstCall ? starting_after : p.starting_after;
          firstCall = false;
          return stripe.promotionCodes.list(
            buildStripeParams<Stripe.PromotionCodeListParams>({
              ...filters,
              limit: p.limit,
              ...(sa ? { starting_after: sa } : {}),
            }),
          );
        },
        maxItems ? { maxItems } : undefined,
      );
      return JSON.stringify(listEnvelope(items), null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
