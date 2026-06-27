import { z } from 'zod';
import type Stripe from 'stripe';
import type { ToolDefinition } from '../../types/index.js';
import { getStripeClient } from '../../config.js';
import { formatStripeError } from '../../utils/format-stripe-error.js';
import { paginateAll } from '../../utils/pagination.js';
import { formatAmount, normalizeToMonthly } from '../../utils/currency.js';
import { nowUnix, fromUnixTimestamp } from '../../utils/date.js';

const inputSchema = z.object({
  currency: z
    .string()
    .min(3)
    .max(3)
    .optional()
    .describe(
      'Primary currency (3-letter lowercase ISO code) used for totals and top customers. Defaults to "usd". Subscriptions in other currencies are still broken out in mrr_by_currency.',
    ),
  include_trials: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, include subscriptions currently in trial. Defaults to false.'),
});

interface CustomerMrr {
  customer_id: string;
  email: string | null;
  name: string | null;
  mrr: number;
}

interface PlanMrr {
  mrr: number;
  customer_count: number;
}

export const toolDefinition: ToolDefinition = {
  definition: {
    name: 'stripe_analytics_get_mrr',
    description:
      'Compute Monthly Recurring Revenue (MRR) by aggregating all active subscriptions client-side (Stripe has no native MRR endpoint). Returns total MRR, breakdowns by plan and currency, top 10 customers by MRR, and active subscription count. Trial subscriptions are excluded by default.',
    inputSchema: {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          description: 'Primary currency for totals (default "usd").',
        },
        include_trials: {
          type: 'boolean',
          default: false,
          description: 'Include trialing subscriptions in totals.',
        },
      },
    },
  },
  async execute(input: unknown): Promise<string> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return `Validation error: ${parsed.error.message}`;
    const currency = (parsed.data.currency ?? 'usd').toLowerCase();
    const includeTrials = parsed.data.include_trials;
    const stripe = getStripeClient();

    try {
      const now = nowUnix();

      const subscriptions = await paginateAll<Stripe.Subscription>(
        (p) =>
          stripe.subscriptions.list({
            ...p,
            status: 'active',
            expand: ['data.customer', 'data.items.data.price'],
          }),
        { maxItems: 10_000 },
      );

      // Also fetch trialing subscriptions if include_trials is true (status: 'active'
      // returns subs in active cycle, but trials surface separately).
      let trialing: Stripe.Subscription[] = [];
      if (includeTrials) {
        trialing = await paginateAll<Stripe.Subscription>(
          (p) =>
            stripe.subscriptions.list({
              ...p,
              status: 'trialing',
              expand: ['data.customer', 'data.items.data.price'],
            }),
          { maxItems: 10_000 },
        );
      }

      const allSubs = [...subscriptions, ...trialing];

      const mrrByCurrency: Record<string, number> = {};
      const mrrByPlan: Record<string, PlanMrr> = {};
      const mrrByCustomer: Record<string, CustomerMrr> = {};
      let chosenCurrencyMrr = 0;
      let activeSubscriptionCount = 0;

      for (const sub of allSubs) {
        // Skip trials unless include_trials is true.
        const isTrial =
          sub.status === 'trialing' ||
          (typeof sub.trial_end === 'number' && sub.trial_end > now);
        if (isTrial && !includeTrials) continue;

        activeSubscriptionCount += 1;

        const customerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? 'unknown';

        const customerEmail =
          typeof sub.customer === 'object' && sub.customer && 'email' in sub.customer
            ? ((sub.customer as Stripe.Customer).email ?? null)
            : null;
        const customerName =
          typeof sub.customer === 'object' && sub.customer && 'name' in sub.customer
            ? ((sub.customer as Stripe.Customer).name ?? null)
            : null;

        let subMrr = 0;
        let subCurrency: string | null = null;

        for (const item of sub.items.data) {
          const price = item.price;
          if (!price || !price.recurring) continue;
          const itemCurrency = price.currency;
          const interval = price.recurring.interval;
          const unitAmount = price.unit_amount ?? 0;
          const quantity = item.quantity ?? 1;
          const monthlyMajor = normalizeToMonthly(unitAmount, itemCurrency, interval) * quantity;

          subMrr += monthlyMajor;
          subCurrency = itemCurrency;

          // By currency (major units).
          mrrByCurrency[itemCurrency] = (mrrByCurrency[itemCurrency] ?? 0) + monthlyMajor;

          // By plan (only for chosen currency, to keep totals consistent).
          if (itemCurrency === currency) {
            const planKey = price.nickname || price.id;
            const existing = mrrByPlan[planKey] ?? { mrr: 0, customer_count: 0 };
            existing.mrr += monthlyMajor;
            existing.customer_count += 1;
            mrrByPlan[planKey] = existing;
          }
        }

        if (subCurrency === currency) {
          chosenCurrencyMrr += subMrr;
        }

        // Aggregate per-customer MRR across chosen currency only (for top customers).
        if (subCurrency === currency) {
          const existing = mrrByCustomer[customerId];
          if (existing) {
            existing.mrr += subMrr;
          } else {
            mrrByCustomer[customerId] = {
              customer_id: customerId,
              email: customerEmail,
              name: customerName,
              mrr: subMrr,
            };
          }
        }
      }

      const topCustomers = Object.values(mrrByCustomer)
        .sort((a, b) => b.mrr - a.mrr)
        .slice(0, 10)
        .map((c) => ({
          customer_id: c.customer_id,
          email: c.email,
          name: c.name,
          mrr: Number(c.mrr.toFixed(2)),
          mrr_formatted: formatAmount(Math.round(c.mrr * 100), currency),
        }));

      const totalMrr = Number(chosenCurrencyMrr.toFixed(2));

      const summary = {
        total_mrr: totalMrr,
        total_mrr_formatted: formatAmount(Math.round(totalMrr * 100), currency),
        mrr_by_plan: Object.fromEntries(
          Object.entries(mrrByPlan).map(([k, v]) => [
            k,
            { mrr: Number(v.mrr.toFixed(2)), customer_count: v.customer_count },
          ]),
        ),
        mrr_by_currency: Object.fromEntries(
          Object.entries(mrrByCurrency).map(([k, v]) => [k, Number(v.toFixed(2))]),
        ),
        top_customers_by_mrr: topCustomers,
        active_subscription_count: activeSubscriptionCount,
        currency,
        computed_at: fromUnixTimestamp(now),
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      return formatStripeError(error);
    }
  },
};
