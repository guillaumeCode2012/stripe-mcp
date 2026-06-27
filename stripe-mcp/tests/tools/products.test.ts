import { describe, it, expect, vi, beforeEach } from 'vitest';

// Swappable implementations — see DECISIONS.md 009 for why we avoid vi.fn for
// the error path (vitest's spy instrumentation resurfaces throws as test
// failures even when the tool's try/catch handles them).
type Impl = (...args: unknown[]) => unknown;
let createImpl: Impl = async () => ({ id: 'prod_new', name: 'Pro' });
let getImpl: Impl = async () => ({ id: 'prod_1', name: 'Pro' });
let updateImpl: Impl = async () => ({ id: 'prod_1', name: 'Pro Plus' });
let listImpl: Impl = async () => ({ data: [], has_more: false });

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    products: {
      create: (...a: unknown[]) => createImpl(...a),
      retrieve: (...a: unknown[]) => getImpl(...a),
      update: (...a: unknown[]) => updateImpl(...a),
      list: (...a: unknown[]) => listImpl(...a),
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as createProduct } from '../../src/tools/products/create-product.js';
import { toolDefinition as getProduct } from '../../src/tools/products/get-product.js';
import { toolDefinition as updateProduct } from '../../src/tools/products/update-product.js';
import { toolDefinition as archiveProduct } from '../../src/tools/products/archive-product.js';
import { toolDefinition as listProducts } from '../../src/tools/products/list-products.js';

describe('stripe_products_create', () => {
  beforeEach(() => {
    createImpl = vi.fn();
  });

  it('creates a product with a name and returns the object', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 'prod_new', name: 'Pro', active: true });
    const result = await createProduct.execute({ name: 'Pro', description: 'Pro plan' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('prod_new');
    expect(createImpl).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pro' }));
  });

  it('requires a name', async () => {
    const result = await createProduct.execute({ description: 'no name' });
    expect(result).toContain('Validation error');
  });

  it('accepts an array of image URLs', async () => {
    createImpl = vi.fn().mockResolvedValue({ id: 'prod_x' });
    await createProduct.execute({
      name: 'Pro',
      images: ['https://example.com/a.png', 'https://example.com/b.png'],
    });
    expect(createImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        images: ['https://example.com/a.png', 'https://example.com/b.png'],
      }),
    );
  });
});

describe('stripe_products_get', () => {
  beforeEach(() => {
    getImpl = vi.fn();
  });

  it('retrieves a product by id', async () => {
    getImpl = vi.fn().mockResolvedValue({ id: 'prod_1', name: 'Pro' });
    const result = await getProduct.execute({ product_id: 'prod_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('prod_1');
    expect(getImpl).toHaveBeenCalledWith('prod_1', expect.anything());
  });

  it('requires a product_id', async () => {
    const result = await getProduct.execute({});
    expect(result).toContain('Validation error');
  });
});

describe('stripe_products_update', () => {
  beforeEach(() => {
    updateImpl = vi.fn();
  });

  it('updates a product name', async () => {
    updateImpl = vi.fn().mockResolvedValue({ id: 'prod_1', name: 'Pro Plus' });
    const result = await updateProduct.execute({ product_id: 'prod_1', name: 'Pro Plus' });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('Pro Plus');
    expect(updateImpl).toHaveBeenCalledWith('prod_1', expect.objectContaining({ name: 'Pro Plus' }));
  });

  it('requires a product_id', async () => {
    const result = await updateProduct.execute({ name: 'x' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_products_archive', () => {
  beforeEach(() => {
    updateImpl = vi.fn();
  });

  it('archives a product by setting active=false', async () => {
    updateImpl = vi.fn().mockResolvedValue({ id: 'prod_1', active: false });
    const result = await archiveProduct.execute({ product_id: 'prod_1' });
    const parsed = JSON.parse(result);
    expect(parsed.active).toBe(false);
    expect(updateImpl).toHaveBeenCalledWith('prod_1', expect.objectContaining({ active: false }));
  });

  it('requires a product_id', async () => {
    const result = await archiveProduct.execute({});
    expect(result).toContain('Validation error');
  });
});

describe('stripe_products_list', () => {
  beforeEach(() => {
    listImpl = vi.fn();
  });

  it('returns products in a total_count envelope', async () => {
    listImpl = vi.fn().mockResolvedValue({
      data: [{ id: 'prod_1' }, { id: 'prod_2' }],
      has_more: false,
    });
    const result = await listProducts.execute({ limit: 25 });
    const parsed = JSON.parse(result);
    expect(parsed.total_count).toBe(2);
    expect(parsed.data).toHaveLength(2);
  });

  it('filters by active when provided', async () => {
    listImpl = vi.fn().mockResolvedValue({ data: [], has_more: false });
    await listProducts.execute({ limit: 10, active: true });
    expect(listImpl).toHaveBeenCalledWith(expect.objectContaining({ active: true }));
  });

  it('rejects an invalid active value (must be boolean)', async () => {
    const result = await listProducts.execute({ limit: 10, active: 'yes' });
    expect(result).toContain('Validation error');
  });
});
