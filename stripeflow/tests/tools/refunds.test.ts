import { describe, it, expect, vi, beforeEach } from 'vitest';

type Impl = (...args: unknown[]) => unknown;
let createImpl: Impl = async () => ({ id: 're_new' });
let getImpl: Impl = async () => ({ id: 're_1' });
let listImpl: Impl = async () => ({ data: [], has_more: false });

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    refunds: {
      create: (...a: unknown[]) => createImpl(...a),
      retrieve: (...a: unknown[]) => getImpl(...a),
      list: (...a: unknown[]) => listImpl(...a),
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as createRefund } from '../../src/tools/refunds/create-refund.js';
import { toolDefinition as getRefund } from '../../src/tools/refunds/get-refund.js';
import { toolDefinition as listRefunds } from '../../src/tools/refunds/list-refunds.js';

describe('stripe_refunds_create', () => {
  beforeEach(() => {
    createImpl = vi.fn();
  });

  it('creates a full refund by payment_intent id', async () => {
    createImpl = vi.fn().mockResolvedValue({
      id: 're_new',
      amount: 5000,
      currency: 'usd',
      payment_intent: 'pi_1',
      status: 'succeeded',
    });
    const result = await createRefund.execute({ payment_intent: 'pi_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('re_new');
    expect(createImpl).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: 'pi_1' }));
  });

  it('creates a partial refund with an explicit amount + reason', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 're_partial' });
    await createRefund.execute({
      payment_intent: 'pi_1',
      amount: 2000,
      reason: 'requested_by_customer',
    });
    expect(createImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_1',
        amount: 2000,
        reason: 'requested_by_customer',
      }),
    );
  });

  it('rejects an invalid reason enum', async () => {
    const result = await createRefund.execute({
      payment_intent: 'pi_1',
      reason: 'because_i_said_so',
    });
    expect(result).toContain('Validation error');
  });

  it('requires either a payment_intent or a charge', async () => {
    const result = await createRefund.execute({ amount: 1000 });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_refunds_get', () => {
  beforeEach(() => {
    getImpl = vi.fn();
  });

  it('retrieves a refund by id', async () => {
    getImpl = vi.fn().mockResolvedValue({ id: 're_1', amount: 5000, status: 'succeeded' });
    const result = await getRefund.execute({ refund_id: 're_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('re_1');
    expect(getImpl).toHaveBeenCalledWith('re_1', expect.anything());
  });

  it('requires a refund_id', async () => {
    const result = await getRefund.execute({});
    expect(result).toContain('Validation error');
  });
});

describe('stripe_refunds_list', () => {
  beforeEach(() => {
    listImpl = vi.fn();
  });

  it('returns refunds in a total_count envelope', async () => {
    listImpl = vi.fn().mockResolvedValue({
      data: [{ id: 're_1' }, { id: 're_2' }],
      has_more: false,
    });
    const result = await listRefunds.execute({ limit: 20 });
    const parsed = JSON.parse(result);
    expect(parsed.total_count).toBe(2);
  });

  it('filters by payment_intent when provided', async () => {
    listImpl = vi.fn().mockResolvedValue({ data: [], has_more: false });
    await listRefunds.execute({ limit: 10, payment_intent: 'pi_1' });
    expect(listImpl).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: 'pi_1' }));
  });

  it('filters by charge when provided', async () => {
    listImpl = vi.fn().mockResolvedValue({ data: [], has_more: false });
    await listRefunds.execute({ limit: 10, charge: 'ch_1' });
    expect(listImpl).toHaveBeenCalledWith(expect.objectContaining({ charge: 'ch_1' }));
  });
});
