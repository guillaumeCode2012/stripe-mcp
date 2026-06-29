import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';
import { formatAmount, normalizeToMonthly } from '../../utils/currency.js';
import { daysAgoUnix, nowUnix, fromUnixTimestamp } from '../../utils/date.js';

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Number of top customers to return (default 10, max 50).'),
  metric: z
    .enum(['lifetime_value', 'mrr', 'payment_count'])
    .optional()
    .describe('Ranking metric: lifetime_value (default), mrr, or payment_count.'),
  period_days: z
    .number()
    .int()
    .min(1)
    .max(3650)
    .optional()
    .describe('If provided, only count charges within the last N days for lifetime_value / payment_count. Ignored for mrr.'),
});

interface CustomerAgg {
  customer_id: string;
  email: string | null;
  name: string | null;
  value: number;
  charge_count: number;
  currency: string;
}

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_analytics_get_top_customers',
    description:
      'Rank customers by lifetime_value, MRR, or payment_count. For lifetime_value/payment_count, fetches all succeeded charges in the lookback window (or all time) and groups by customer. For MRR, computes per-customer MRR from active subscriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Top N (default 10).' },
        metric: {
          type: 'string',
          enum: ['lifetime_value', 'mrr', 'payment_count'],
          description: 'Ranking metric (default lifetime_value).',
        },
        period_days: {
          type: 'integer',
          minimum: 1,
          maximum: 3650,
          description: 'Lookback window in days for lifetime_value/payment_count.',
        },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const limit = parsed.data.limit ?? 10;
    const metric = parsed.data.metric ?? 'lifetime_value';
    const periodDays = parsed.data.period_days;

    const stripe = getStripeClient();
    try {
      const now = nowUnix();

      // Fetch all customers so we have email/name even for those without charges in window.
      const customers = await paginateAll<Stripe.Customer>(
        (p) => stripe.customers.list(p),
        { maxItems: 50_000 },
      );
      const customerMap = new Map<string, { email: string | null; name: string | null }>();
      for (const c of customers) {
        customerMap.set(c.id, { email: c.email ?? null, name: c.name ?? null });
      }

      const agg = new Map<string, CustomerAgg>();

      const ensure = (customerId: string, currency: string): CustomerAgg => {
        let a = agg.get(customerId);
        if (!a) {
          const ident = customerMap.get(customerId);
          a = {
            customer_id: customerId,
            email: ident?.email ?? null,
            name: ident?.name ?? null,
            value: 0,
            charge_count: 0,
            currency,
          };
          agg.set(customerId, a);
        }
        return a;
      };

      let primaryCurrency = 'usd';
      let metricLabel: string;
      let valueFormattedFn: (value: number, currency: string) => string;

      if (metric === 'mrr') {
        metricLabel = 'MRR';
        const subs = await paginateAll<Stripe.Subscription>(
          (p) =>
            stripe.subscriptions.list({
              ...p,
              status: 'active',
              expand: ['data.customer', 'data.items.data.price'],
            }),
          { maxItems: 50_000 },
        );

        for (const sub of subs) {
          const isTrial =
            sub.status === 'trialing' ||
            (typeof sub.trial_end === 'number' && sub.trial_end > now);
          if (isTrial) continue;

          const customerId =
            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? 'unknown';

          let subMrr = 0;
          let subCurrency = 'usd';
          for (const item of sub.items.data) {
            const price = item.price;
            if (!price || !price.recurring) continue;
            subCurrency = price.currency;
            if (!primaryCurrency) primaryCurrency = subCurrency;
            const unitAmount = price.unit_amount ?? 0;
            const quantity = item.quantity ?? 1;
            subMrr += normalizeToMonthly(unitAmount, subCurrency, price.recurring.interval) * quantity;
          }
          primaryCurrency = subCurrency;
          const a = ensure(customerId, subCurrency);
          a.value += subMrr;
        }

        valueFormattedFn = (v: number, currency: string) => formatAmount(Math.round(v * 100), currency);
      } else {
        // lifetime_value or payment_count — both use succeeded charges.
        metricLabel = metric === 'lifetime_value' ? 'Lifetime Value' : 'Payment Count';

        const createdFilter =
          periodDays !== undefined ? ({ gte: daysAgoUnix(periodDays) } as const) : undefined;

        const charges = await paginateAll<Stripe.Charge>(
          (p) =>
            stripe.charges.list({
              ...p,
              ...(createdFilter ? { created: createdFilter } : {}),
            }),
          { maxItems: 100_000 },
        );

        for (const charge of charges) {
          // ChargeListParams does not expose a server-side `status` filter in this
          // SDK version, so we filter succeeded charges client-side.
          if (charge.status !== 'succeeded') continue;
          const customerId = typeof charge.customer === 'string' ? charge.customer : null;
          if (!customerId) continue;
          if (!primaryCurrency && charge.currency) primaryCurrency = charge.currency;
          const a = ensure(customerId, charge.currency ?? primaryCurrency);
          if (metric === 'lifetime_value') {
            a.value += charge.amount ?? 0;
          }
          a.charge_count += 1;
          if (metric === 'payment_count') {
            a.value += 1;
          }
        }

        valueFormattedFn =
          metric === 'lifetime_value'
            ? (v: number, currency: string) => formatAmount(v, currency)
            : () => '';
      }

      const sorted = Array.from(agg.values())
        .filter((a) => a.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

      const ranked = sorted.map((a, idx) => ({
        rank: idx + 1,
        customer_id: a.customer_id,
        email: a.email,
        name: a.name,
        value: metric === 'lifetime_value' ? a.value : Number(a.value.toFixed(2)),
        value_formatted: metric === 'payment_count' ? `${a.charge_count} payments` : valueFormattedFn(a.value, a.currency),
        metric_label: metricLabel,
      }));

      const summary = {
        metric,
        metric_label: metricLabel,
        period_days: periodDays ?? null,
        computed_at_iso: fromUnixTimestamp(now),
        ranked,
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
