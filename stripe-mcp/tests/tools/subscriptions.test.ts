import { describe, it, expect, vi, beforeEach } from 'vitest';

// Swappable implementations. Happy-path tests assign `vi.fn()`s so we can
// assert call arguments; the error-path test assigns a PLAIN throwing
// function (not a vi.fn) so vitest's mock-spy instrumentation does not
// resurface the throw as a test failure — our tool's try/catch handles it
// and `execute` resolves with a formatted error string. See DECISIONS.md 009.
type Impl = (...args: unknown[]) => unknown;
let listImpl: Impl = async () => ({ data: [], has_more: false });
let createImpl: Impl = async () => ({ id: 'sub_new' });
let cancelImpl: Impl = async () => ({ id: 'sub_1', status: 'canceled' });

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    subscriptions: {
      list: (...args: unknown[]) => listImpl(...args),
      create: (...args: unknown[]) => createImpl(...args),
      cancel: (...args: unknown[]) => cancelImpl(...args),
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as listSubscriptions } from '../../src/tools/subscriptions/list-subscriptions.js';
import { toolDefinition as createSubscription } from '../../src/tools/subscriptions/create-subscription.js';
import { toolDefinition as cancelSubscription } from '../../src/tools/subscriptions/cancel-subscription.js';

describe('stripe_subscriptions_list', () => {
  beforeEach(() => {
    listImpl = vi.fn();
  });

  it('returns subscriptions with a total_count envelope', async () => {
    listImpl = vi.fn().mockResolvedValue({
      data: [{ id: 'sub_1', status: 'active' }],
      has_more: false,
    });
    const result = await listSubscriptions.execute({ limit: 10 });
    const parsed = JSON.parse(result);
    expect(parsed.total_count).toBe(1);
    expect(parsed.data[0].id).toBe('sub_1');
  });

  it('filters by status when provided', async () => {
    listImpl = vi.fn().mockResolvedValue({ data: [], has_more: false });
    await listSubscriptions.execute({ limit: 10, status: 'active' });
    expect(listImpl).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
  });

  it('returns a validation error for an invalid status', async () => {
    const result = await listSubscriptions.execute({ limit: 10, status: 'bogus' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_subscriptions_create', () => {
  beforeEach(() => {
    createImpl = vi.fn();
  });

  it('creates a subscription for a customer with line items', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 'sub_new', status: 'active' });
    const result = await createSubscription.execute({
      customer: 'cus_1',
      items: [{ price: 'price_1', quantity: 2 }],
    });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('sub_new');
    expect(createImpl).toHaveBeenCalledWith(expect.objectContaining({ customer: 'cus_1' }));
  });

  it('requires a customer', async () => {
    const result = await createSubscription.execute({ items: [{ price: 'price_1' }] });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_subscriptions_cancel', () => {
  beforeEach(() => {
    cancelImpl = async () => ({ id: 'sub_1', status: 'canceled' });
  });

  it('cancels a subscription by id', async () => {
    const spy = vi.fn(async () => ({ id: 'sub_1', status: 'canceled' }));
    cancelImpl = spy;
    const result = await cancelSubscription.execute({ subscription_id: 'sub_1' });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('canceled');
    expect(spy).toHaveBeenCalledWith('sub_1', expect.anything());
  });

  it('surfaces a formatted Stripe error on failure', async () => {
    // Plain throwing function (NOT vi.fn) — vitest's spy instrumentation
    // would otherwise resurface this throw as a test failure even though
    // the tool's try/catch catches it and execute resolves with a formatted
    // error string.
    cancelImpl = () => {
      throw {
        type: 'StripeInvalidRequestError',
        message: 'No such subscription: sub_missing',
        param: 'subscription',
      };
    };
    const result = await cancelSubscription.execute({ subscription_id: 'sub_missing' });
    expect(result).toContain('Invalid request');
    expect(result).toContain('No such subscription: sub_missing');
  });
});
