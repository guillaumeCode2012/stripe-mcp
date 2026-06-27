import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';
import { formatAmount } from '../../utils/currency.js';
import { resolvePeriod, fromUnixTimestamp } from '../../utils/date.js';

const inputSchema = z.object({
  period: z
    .enum(['last_7_days', 'last_30_days', 'last_90_days', 'last_12_months', 'month_to_date', 'year_to_date'])
    .describe('Predefined time window for the revenue summary.'),
});

interface TimeBucket {
  date: string;
  gross: number;
  net: number;
  count: number;
}

function bucketKeyFor(chargeCreated: number, useMonthly: boolean): string {
  const d = new Date(chargeCreated * 1000);
  if (useMonthly) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_analytics_get_revenue_summary',
    description:
      'Aggregate gross/net revenue, refunds, payment counts, failure rate, and a time series for a given period. Computes client-side from charges. Returns formatted currency strings alongside raw cent amounts.',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_12_months', 'month_to_date', 'year_to_date'],
          description: 'Predefined window.',
        },
      },
      required: ['period'],
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const period = parsed.data.period;

    const stripe = getStripeClient();
    try {
      const { start, end } = resolvePeriod(period);
      const useMonthly = period === 'last_12_months' || period === 'year_to_date';

      const charges = await paginateAll<Stripe.Charge>(
        (p) =>
          stripe.charges.list({
            ...p,
            created: { gte: start, lte: end },
          }),
        { maxItems: 50_000 },
      );

      let grossRevenue = 0;
      let refundAmount = 0;
      let successfulPayments = 0;
      let failedPayments = 0;
      let primaryCurrency = 'usd';

      const buckets: Record<string, TimeBucket> = {};

      for (const charge of charges) {
        if (!primaryCurrency && charge.currency) primaryCurrency = charge.currency;
        if (charge.currency === primaryCurrency && charge.currency) {
          // already primary
        } else if (charge.currency) {
          // If first charge's currency differs, still take it as primary.
          if (grossRevenue === 0) primaryCurrency = charge.currency;
        }

        const amount = charge.amount ?? 0;
        const refunded = charge.amount_refunded ?? 0;
        const key = bucketKeyFor(charge.created, useMonthly);
        const bucket = (buckets[key] ??= { date: key, gross: 0, net: 0, count: 0 });

        if (charge.status === 'succeeded') {
          grossRevenue += amount;
          successfulPayments += 1;
          refundAmount += refunded;
          bucket.gross += amount;
          bucket.net += amount - refunded;
          bucket.count += 1;
        } else if (charge.status === 'failed') {
          failedPayments += 1;
        }
      }

      const netRevenue = grossRevenue - refundAmount;
      const totalPayments = successfulPayments + failedPayments;
      const failureRatePercent =
        totalPayments > 0 ? Number(((failedPayments / totalPayments) * 100).toFixed(2)) : 0;
      const refundRatePercent =
        grossRevenue > 0 ? Number(((refundAmount / grossRevenue) * 100).toFixed(2)) : 0;
      const avgTransactionValue =
        successfulPayments > 0 ? Math.round(grossRevenue / successfulPayments) : 0;

      const timeSeries = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));

      const summary = {
        period,
        period_start: start,
        period_end: end,
        period_start_iso: fromUnixTimestamp(start),
        period_end_iso: fromUnixTimestamp(end),
        currency: primaryCurrency,
        gross_revenue: grossRevenue,
        gross_revenue_formatted: formatAmount(grossRevenue, primaryCurrency),
        net_revenue: netRevenue,
        net_revenue_formatted: formatAmount(netRevenue, primaryCurrency),
        refund_amount: refundAmount,
        refund_amount_formatted: formatAmount(refundAmount, primaryCurrency),
        refund_rate_percent: refundRatePercent,
        successful_payments: successfulPayments,
        failed_payments: failedPayments,
        failure_rate_percent: failureRatePercent,
        avg_transaction_value: avgTransactionValue,
        avg_transaction_value_formatted: formatAmount(avgTransactionValue, primaryCurrency),
        time_series: timeSeries,
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
