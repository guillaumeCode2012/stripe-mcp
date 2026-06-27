import { describe, it, expect, vi, beforeEach } from 'vitest';

type Impl = (...args: unknown[]) => unknown;
let createImpl: Impl = async () => ({ id: 'price_new' });
let getImpl: Impl = async () => ({ id: 'price_1' });
let updateImpl: Impl = async () => ({ id: 'price_1' });
let listImpl: Impl = async () => ({ data: [], has_more: false });

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    prices: {
      create: (...a: unknown[]) => createImpl(...a),
      retrieve: (...a: unknown[]) => getImpl(...a),
      update: (...a: unknown[]) => updateImpl(...a),
      list: (...a: unknown[]) => listImpl(...a),
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as createPrice } from '../../src/tools/prices/create-price.js';
import { toolDefinition as getPrice } from '../../src/tools/prices/get-price.js';
import { toolDefinition as updatePrice } from '../../src/tools/prices/update-price.js';
import { toolDefinition as listPrices } from '../../src/tools/prices/list-prices.js';

describe('stripe_prices_create', () => {
  beforeEach(() => {
    createImpl = vi.fn();
  });

  it('creates a one-time price with unit_amount + currency + product', async () => {
    createImpl = vi.fn().mockResolvedValue({
      id: 'price_new',
      unit_amount: 2000,
      currency: 'usd',
      product: 'prod_1',
    });
    const result = await createPrice.execute({
      unit_amount: 2000,
      currency: 'usd',
      product: 'prod_1',
    });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('price_new');
    expect(createImpl).toHaveBeenCalledWith(
      expect.objectContaining({ unit_amount: 2000, currency: 'usd', product: 'prod_1' }),
    );
  });

  it('creates a recurring monthly price', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 'price_rec' });
    await createPrice.execute({
      unit_amount: 4900,
      currency: 'usd',
      product: 'prod_1',
      recurring: { interval: 'month', interval_count: 1 },
    });
    expect(createImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        recurring: { interval: 'month', interval_count: 1 },
      }),
    );
  });

  it('accepts product_data instead of a product id', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 'price_x' });
    await createPrice.execute({
      unit_amount: 1000,
      currency: 'usd',
      product_data: { name: 'Sticker pack' },
    });
    expect(createImpl).toHaveBeenCalledWith(
      expect.objectContaining({ product_data: { name: 'Sticker pack' } }),
    );
  });

  it('requires both unit_amount and currency', async () => {
    const result = await createPrice.execute({ currency: 'usd' });
    expect(result).toContain('Validation error');
  });

  it('requires currency to be a lowercase 3-letter code', async () => {
    const result = await createPrice.execute({ unit_amount: 1000, currency: 'US' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_prices_get', () => {
  beforeEach(() => {
    getImpl = vi.fn();
  });

  it('retrieves a price by id', async () => {
    getImpl = vi.fn().mockResolvedValue({ id: 'price_1', unit_amount: 2000 });
    const result = await getPrice.execute({ price_id: 'price_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('price_1');
    expect(getImpl).toHaveBeenCalledWith('price_1', expect.anything());
  });

  it('requires a price_id', async () => {
    const result = await getPrice.execute({});
    expect(result).toContain('Validation error');
  });
});

describe('stripe_prices_update', () => {
  beforeEach(() => {
    updateImpl = vi.fn();
  });

  it('updates a price nickname + lookup_key', async () => {
    updateImpl = vi.fn().mockResolvedValue({ id: 'price_1', nickname: 'Pro monthly' });
    const result = await updatePrice.execute({
      price_id: 'price_1',
      nickname: 'Pro monthly',
      lookup_key: 'pro_monthly',
    });
    const parsed = JSON.parse(result);
    expect(parsed.nickname).toBe('Pro monthly');
    expect(updateImpl).toHaveBeenCalledWith(
      'price_1',
      expect.objectContaining({ nickname: 'Pro monthly', lookup_key: 'pro_monthly' }),
    );
  });

  it('requires a price_id', async () => {
    const result = await updatePrice.execute({ nickname: 'x' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_prices_list', () => {
  beforeEach(() => {
    listImpl = vi.fn();
  });

  it('returns prices in a total_count envelope', async () => {
    listImpl = vi.fn().mockResolvedValue({
      data: [{ id: 'price_1' }, { id: 'price_2' }, { id: 'price_3' }],
      has_more: false,
    });
    const result = await listPrices.execute({ limit: 50 });
    const parsed = JSON.parse(result);
    expect(parsed.total_count).toBe(3);
  });

  it('filters by type when provided', async () => {
    listImpl = vi.fn().mockResolvedValue({ data: [], has_more: false });
    await listPrices.execute({ limit: 10, type: 'recurring' });
    expect(listImpl).toHaveBeenCalledWith(expect.objectContaining({ type: 'recurring' }));
  });

  it('rejects an invalid type value', async () => {
    const result = await listPrices.execute({ limit: 10, type: 'bogus' });
    expect(result).toContain('Validation error');
  });
});
