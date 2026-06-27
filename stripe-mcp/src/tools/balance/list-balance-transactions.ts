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
  payout: z
    .string()
    .optional()
    .describe('Only return transactions paid out on this Payout ID (automatic payouts only).'),
  type: z
    .enum([
      'charge',
      'refund',
      'payout',
      'transfer',
      'payment',
      'payment_failure_refund',
      'payment_refund',
      'payment_reversal',
      'adjustment',
      'application_fee',
      'application_fee_refund',
      'stripe_fee',
      'stripe_fx_fee',
      'topup',
      'topup_reversal',
      'payout_cancel',
      'payout_failure',
      'transfer_cancel',
      'transfer_refund',
      'reserve_transaction',
    ])
    .optional()
    .describe('Filter transactions by type. See https://stripe.com/docs/reports/balance-transaction-types for the full list.'),
  starting_after: z
    .string()
    .optional()
    .describe('Cursor: an existing balance transaction ID to start pagination after.'),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Hard cap on the total number of transactions returned (defaults to 100,000 if omitted).'),
});

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_balance_list_transactions',
    description: `List transactions that have contributed to the Stripe account balance, auto-paginating through every page.

Use this when:
- you need a full ledger of charges, refunds, payouts, and fees
- you are reconciling Stripe activity against your accounting system
- you want to filter balance activity by type or by payout

Returns: \`{ total_count, has_more, data: BalanceTransaction[] }\` with all matching transactions up to max_items.
Stripe docs: https://stripe.com/docs/api/balance_transactions/list`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when max_items is omitted.',
        },
        payout: {
          type: 'string',
          description: 'Only return transactions paid out on this Payout ID (automatic payouts only).',
        },
        type: {
          type: 'string',
          enum: [
            'charge',
            'refund',
            'payout',
            'transfer',
            'payment',
            'payment_failure_refund',
            'payment_refund',
            'payment_reversal',
            'adjustment',
            'application_fee',
            'application_fee_refund',
            'stripe_fee',
            'stripe_fx_fee',
            'topup',
            'topup_reversal',
            'payout_cancel',
            'payout_failure',
            'transfer_cancel',
            'transfer_refund',
            'reserve_transaction',
          ],
          description: 'Filter transactions by type. See https://stripe.com/docs/reports/balance-transaction-types for the full list.',
        },
        starting_after: {
          type: 'string',
          description: 'Cursor: an existing balance transaction ID to start pagination after.',
        },
        max_items: {
          type: 'integer',
          minimum: 1,
          description: 'Hard cap on the total number of transactions returned (defaults to 100,000 if omitted).',
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
      const items = await paginateAll<Stripe.BalanceTransaction>(
        (p) => {
          const sa = firstCall ? starting_after : p.starting_after;
          firstCall = false;
          return stripe.balanceTransactions.list(
            buildStripeParams<Stripe.BalanceTransactionListParams>({
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
