import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';
import { normalizeToMonthly } from '../../utils/currency.js';
import { toUnixTimestamp, nowUnix, fromUnixTimestamp, daysAgoUnix } from '../../utils/date.js';

const inputSchema = z.object({
  period_start: z
    .string()
    .optional()
    .describe('ISO 8601 start of the analysis window. Defaults to 30 days ago.'),
  period_end: z
    .string()
    .optional()
    .describe('ISO 8601 end of the analysis window. Defaults to now.'),
  interval: z
    .enum(['monthly', 'weekly'])
    .optional()
    .describe('Reporting interval label ("monthly" or "weekly"). Defaults to "monthly". Does not change data fetched, only the interval tag.'),
});

interface ChurnedCustomer {
  subscription_id: string;
  customer_id: string;
  email: string | null;
  canceled_at: number;
  canceled_at_iso: string;
  lifetime_value_estimate: number;
  cancellation_reason: string | null;
}

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_analytics_get_churn_rate',
    description:
      'Compute subscription churn rate for a given period. Fetches all subscriptions created before period_end, identifies those canceled within [period_start, period_end], and estimates the active subscription count at period_start. Returns churn_rate_percent, churned_count, churned_customers detail, and active_at_period_start.',
    inputSchema: {
      type: 'object',
      properties: {
        period_start: { type: 'string', description: 'ISO 8601 start (default: 30 days ago).' },
        period_end: { type: 'string', description: 'ISO 8601 end (default: now).' },
        interval: { type: 'string', enum: ['monthly', 'weekly'], description: 'Interval label.' },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const interval = parsed.data.interval ?? 'monthly';

    const periodEnd = parsed.data.period_end
      ? toUnixTimestamp(parsed.data.period_end)
      : nowUnix();
    const periodStart = parsed.data.period_start
      ? toUnixTimestamp(parsed.data.period_start)
      : daysAgoUnix(30);

    if (periodStart >= periodEnd) {
      return `Validation error: period_start must be before period_end.`;
    }

    const stripe = getStripeClient();

    try {
      // Fetch all subscriptions created before period_end with status='all'.
      // This single fetch gives us both churned_in_period and active_at_start.
      const allSubs = await paginateAll<Stripe.Subscription>(
        (p) =>
          stripe.subscriptions.list({
            ...p,
            status: 'all',
            created: { lt: periodEnd },
            expand: ['data.customer', 'data.items.data.price'],
          }),
        { maxItems: 50_000 },
      );

      const churned: ChurnedCustomer[] = [];
      let activeAtStart = 0;

      for (const sub of allSubs) {
        const created = sub.created ?? 0;
        const canceledAt = sub.canceled_at;

        // Was this sub active at period_start?
        // Active = created before period_start AND (not canceled OR canceled after period_start)
        const wasActiveAtStart =
          created <= periodStart && (canceledAt === null || canceledAt > periodStart);
        if (wasActiveAtStart) activeAtStart += 1;

        // Churned in period?
        if (canceledAt !== null && canceledAt >= periodStart && canceledAt <= periodEnd) {
          const customerId =
            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? 'unknown';
          const customerEmail =
            typeof sub.customer === 'object' && sub.customer && 'email' in sub.customer
              ? (sub.customer as Stripe.Customer).email
              : null;

          // Estimate lifetime value: sum across items of (monthly_value * months_active).
          const monthsActive = Math.max(
            1,
            (canceledAt - created) / (30 * 24 * 60 * 60),
          );
          let ltv = 0;
          for (const item of sub.items.data) {
            const price = item.price;
            if (!price || !price.recurring) continue;
            const unitAmount = price.unit_amount ?? 0;
            const quantity = item.quantity ?? 1;
            const monthlyMajor = normalizeToMonthly(unitAmount, price.currency, price.recurring.interval) * quantity;
            ltv += monthlyMajor * monthsActive;
          }

          const cancellationReason = sub.cancellation_details?.reason ?? null;

          churned.push({
            subscription_id: sub.id,
            customer_id: customerId,
            email: customerEmail,
            canceled_at: canceledAt,
            canceled_at_iso: fromUnixTimestamp(canceledAt),
            lifetime_value_estimate: Number(ltv.toFixed(2)),
            cancellation_reason: cancellationReason,
          });
        }
      }

      const churnRatePercent =
        activeAtStart > 0 ? Number(((churned.length / activeAtStart) * 100).toFixed(2)) : 0;

      const summary = {
        churn_rate_percent: churnRatePercent,
        churned_count: churned.length,
        active_at_period_start: activeAtStart,
        period_start: periodStart,
        period_end: periodEnd,
        period_start_iso: fromUnixTimestamp(periodStart),
        period_end_iso: fromUnixTimestamp(periodEnd),
        interval,
        churned_customers: churned.sort((a, b) => b.canceled_at - a.canceled_at),
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
