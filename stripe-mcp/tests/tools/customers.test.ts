import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Stripe client before importing the tools under test.
const mockList = vi.fn();
const mockCreate = vi.fn();
const mockRetrieve = vi.fn();

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    customers: {
      list: mockList,
      create: mockCreate,
      retrieve: mockRetrieve,
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as listCustomers } from '../../src/tools/customers/list-customers.js';
import { toolDefinition as createCustomer } from '../../src/tools/customers/create-customer.js';
import { toolDefinition as getCustomer } from '../../src/tools/customers/get-customer.js';

describe('stripe_customers_list', () => {
  beforeEach(() => {
    mockList.mockReset();
  });

  it('returns customers on valid input', async () => {
    mockList.mockResolvedValue({
      data: [{ id: 'cus_1', email: 'a@b.com' }],
      has_more: false,
    });
    const result = await listCustomers.execute({ limit: 10 });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('data');
    expect(parsed.total_count).toBe(1);
    expect(parsed.data[0].id).toBe('cus_1');
  });

  it('returns a validation error when limit exceeds the max', async () => {
    const result = await listCustomers.execute({ limit: 999 });
    expect(result).toContain('Validation error');
  });

  it('returns a formatted Stripe error when the API rejects', async () => {
    // Use a synchronous throw so vitest doesn't track an unhandled rejection.
    mockList.mockImplementation(() => {
      throw {
        type: 'StripeAuthenticationError',
        message: 'Invalid API Key provided',
      };
    });
    const result = await listCustomers.execute({ limit: 10 });
    expect(result).toContain('Authentication failed');
  });
});

describe('stripe_customers_create', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('creates a customer and returns the object', async () => {
    mockCreate.mockResolvedValue({ id: 'cus_new', email: 'x@y.com' });
    const result = await createCustomer.execute({ email: 'x@y.com', name: 'Test' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('cus_new');
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ email: 'x@y.com' }));
  });

  it('rejects an invalid email', async () => {
    const result = await createCustomer.execute({ email: 'not-an-email' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_customers_get', () => {
  beforeEach(() => {
    mockRetrieve.mockReset();
  });

  it('retrieves a customer by id', async () => {
    mockRetrieve.mockResolvedValue({ id: 'cus_1', email: 'a@b.com' });
    const result = await getCustomer.execute({ customer_id: 'cus_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('cus_1');
    expect(mockRetrieve).toHaveBeenCalledWith('cus_1', expect.anything());
  });

  it('requires a customer_id', async () => {
    const result = await getCustomer.execute({});
    expect(result).toContain('Validation error');
  });
});
