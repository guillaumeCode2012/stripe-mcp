import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSubList = vi.fn();
const mockChargesList = vi.fn();

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    subscriptions: { list: mockSubList },
    charges: { list: mockChargesList },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as getMrr } from '../../src/tools/analytics/get-mrr.js';
import { toolDefinition as getRevenueSummary } from '../../src/tools/analytics/get-revenue-summary.js';

function subFixture(id: string, customer: string, amount: number, interval: string, nickname?: string) {
  return {
    id,
    status: 'active',
    customer,
    trial_end: null,
    items: {
      data: [
        {
          price: {
            id: `price_${id}`,
            currency: 'usd',
            unit_amount: amount,
            recurring: { interval },
            ...(nickname ? { nickname } : {}),
          },
          quantity: 1,
        },
      ],
    },
  };
}

describe('stripe_analytics_get_mrr', () => {
  beforeEach(() => {
    mockSubList.mockReset();
  });

  it('computes MRR from active monthly subscriptions', async () => {
    // 1 monthly $20 sub + 1 yearly $120 sub (= $10/mo) => total $30/mo.
    mockSubList.mockResolvedValue({
      data: [subFixture('sub_m', 'cus_1', 2000, 'month', 'Pro'), subFixture('sub_y', 'cus_2', 12000, 'year', 'Annual')],
      has_more: false,
    });
    const result = await getMrr.execute({});
    const parsed = JSON.parse(result);
    expect(parsed.active_subscription_count).toBe(2);
    expect(parsed.total_mrr).toBeCloseTo(30, 5);
    expect(parsed.mrr_by_currency.usd).toBeCloseTo(30, 5);
    expect(parsed.mrr_by_plan.Pro.mrr).toBeCloseTo(20, 5);
    expect(parsed.mrr_by_plan.Annual.mrr).toBeCloseTo(10, 5);
  });

  it('returns a validation error for an invalid currency', async () => {
    const result = await getMrr.execute({ currency: 123 as unknown as string });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_analytics_get_revenue_summary', () => {
  beforeEach(() => {
    mockChargesList.mockReset();
  });

  it('sums gross revenue and counts successful payments', async () => {
    mockChargesList.mockResolvedValue({
      data: [
        { id: 'ch_1', status: 'succeeded', amount: 5000, currency: 'usd', refunded: 0 },
        { id: 'ch_2', status: 'succeeded', amount: 2500, currency: 'usd', refunded: 0 },
        { id: 'ch_3', status: 'failed', amount: 1000, currency: 'usd', refunded: 0 },
      ],
      has_more: false,
    });
    const result = await getRevenueSummary.execute({ period: 'last_30_days' });
    const parsed = JSON.parse(result);
    expect(parsed.successful_payments).toBe(2);
    expect(parsed.failed_payments).toBe(1);
    expect(parsed.gross_revenue).toBe(7500);
    expect(parsed.failure_rate_percent).toBeCloseTo(33.33, 1);
  });

  it('requires a valid period', async () => {
    const result = await getRevenueSummary.execute({ period: 'last_2_days' as unknown as string });
    expect(result).toContain('Validation error');
  });
});
