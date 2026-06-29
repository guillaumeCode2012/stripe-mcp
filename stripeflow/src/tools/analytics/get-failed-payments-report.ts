import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';
import { formatAmount } from '../../utils/currency.js';
import { daysAgoUnix, fromUnixTimestamp, nowUnix } from '../../utils/date.js';

const inputSchema = z.object({
  period_days: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .describe('Lookback window in days (default 30).'),
});

interface ReasonBreakdown {
  count: number;
  amount: number;
}

interface AffectedCustomer {
  customer_id: string;
  email: string | null;
  failed_count: number;
  failed_amount: number;
  failed_amount_formatted: string;
  last_failure_decline_code: string;
  last_failure_at: number;
  last_failure_at_iso: string;
  recovery_suggestion: string;
}

const RECOVERY_SUGGESTIONS: Record<string, string> = {
  insufficient_funds: 'Ask customer to use a different card or top up.',
  expired_card: 'Ask customer for a new card.',
  lost_card: 'Do not retry; ask customer for a new card.',
  stolen_card: 'Do not retry; ask customer for a new card.',
  generic_decline: 'Ask customer to contact their bank or use a different card.',
};

function recoverySuggestion(declineCode: string): string {
  return (
    RECOVERY_SUGGESTIONS[declineCode] ??
    'Retry after the customer updates their payment method.'
  );
}

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_analytics_get_failed_payments_report',
    description:
      'Report on failed charges over the last N days. Returns total failed amount, count, a breakdown by decline code, and per-customer failure summaries with recovery suggestions.',
    inputSchema: {
      type: 'object',
      properties: {
        period_days: {
          type: 'integer',
          minimum: 1,
          maximum: 365,
          description: 'Lookback window in days (default 30).',
        },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const periodDays = parsed.data.period_days ?? 30;
    const start = daysAgoUnix(periodDays);

    const stripe = getStripeClient();
    try {
      const charges = await paginateAll<Stripe.Charge>(
        (p) =>
          stripe.charges.list({
            ...p,
            created: { gte: start },
          }),
        { maxItems: 100_000 },
      );

      let totalFailedAmount = 0;
      let primaryCurrency = 'usd';
      const reasons: Record<string, ReasonBreakdown> = {};
      const byCustomer = new Map<
        string,
        {
          customer_id: string;
          email: string | null;
          failed_count: number;
          failed_amount: number;
          last_failure_at: number;
          last_failure_decline_code: string;
        }
      >();

      let failedCount = 0;
      for (const charge of charges) {
        // ChargeListParams does not expose a server-side `status` filter in this
        // SDK version, so we filter client-side.
        if (charge.status !== 'failed') continue;
        failedCount += 1;
        const amount = charge.amount ?? 0;
        totalFailedAmount += amount;
        if (!primaryCurrency && charge.currency) primaryCurrency = charge.currency;

        const declineCode = charge.failure_code ?? 'unknown';
        const r = reasons[declineCode] ?? { count: 0, amount: 0 };
        r.count += 1;
        r.amount += amount;
        reasons[declineCode] = r;

        const customerId = typeof charge.customer === 'string' ? charge.customer : null;
        if (!customerId) continue;

        const existing = byCustomer.get(customerId);
        if (existing) {
          existing.failed_count += 1;
          existing.failed_amount += amount;
          if (charge.created > existing.last_failure_at) {
            existing.last_failure_at = charge.created;
            existing.last_failure_decline_code = declineCode;
          }
        } else {
          // Best-effort email lookup: charges don't include customer email unless expanded.
          byCustomer.set(customerId, {
            customer_id: customerId,
            email: null,
            failed_count: 1,
            failed_amount: amount,
            last_failure_at: charge.created,
            last_failure_decline_code: declineCode,
          });
        }
      }

      // Hydrate customer emails (paginate once, then look up).
      const affectedCustomerIds = new Set(byCustomer.keys());
      const affectedCustomers: AffectedCustomer[] = [];
      if (affectedCustomerIds.size > 0) {
        const customers = await paginateAll<Stripe.Customer>(
          (p) => stripe.customers.list(p),
          { maxItems: 50_000 },
        );
        const emailMap = new Map<string, string | null>();
        for (const c of customers) {
          emailMap.set(c.id, c.email);
        }
        for (const agg of byCustomer.values()) {
          affectedCustomers.push({
            customer_id: agg.customer_id,
            email: emailMap.get(agg.customer_id) ?? null,
            failed_count: agg.failed_count,
            failed_amount: agg.failed_amount,
            failed_amount_formatted: formatAmount(agg.failed_amount, primaryCurrency),
            last_failure_decline_code: agg.last_failure_decline_code,
            last_failure_at: agg.last_failure_at,
            last_failure_at_iso: fromUnixTimestamp(agg.last_failure_at),
            recovery_suggestion: recoverySuggestion(agg.last_failure_decline_code),
          });
        }
      }

      affectedCustomers.sort((a, b) => b.failed_amount - a.failed_amount);

      const summary = {
        period_days: periodDays,
        period_start: start,
        period_end: nowUnix(),
        period_start_iso: fromUnixTimestamp(start),
        currency: primaryCurrency,
        total_failed_amount: totalFailedAmount,
        total_failed_amount_formatted: formatAmount(totalFailedAmount, primaryCurrency),
        count: failedCount,
        failure_reasons_breakdown: reasons,
        affected_customers: affectedCustomers,
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
