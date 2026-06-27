import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockList = vi.fn();
const mockFinalize = vi.fn();
const mockRetrieve = vi.fn();

vi.mock('../../src/config.js', () => ({
  getStripeClient: () => ({
    invoices: {
      list: mockList,
      finalizeInvoice: mockFinalize,
      retrieve: mockRetrieve,
    },
  }),
  config: { stripeMode: 'test' },
}));

import { toolDefinition as listInvoices } from '../../src/tools/invoices/list-invoices.js';
import { toolDefinition as finalizeInvoice } from '../../src/tools/invoices/finalize-invoice.js';
import { toolDefinition as getInvoice } from '../../src/tools/invoices/get-invoice.js';

describe('stripe_invoices_list', () => {
  beforeEach(() => mockList.mockReset());

  it('returns invoices in a total_count envelope', async () => {
    mockList.mockResolvedValue({
      data: [{ id: 'in_1', status: 'open', amount_due: 5000 }],
      has_more: false,
    });
    const result = await listInvoices.execute({ limit: 25 });
    const parsed = JSON.parse(result);
    expect(parsed.total_count).toBe(1);
    expect(parsed.data[0].id).toBe('in_1');
  });

  it('rejects an invalid status enum', async () => {
    const result = await listInvoices.execute({ limit: 10, status: 'bogus' });
    expect(result).toContain('Validation error');
  });
});

describe('stripe_invoices_finalize', () => {
  beforeEach(() => mockFinalize.mockReset());

  it('finalizes an invoice by id', async () => {
    mockFinalize.mockResolvedValue({ id: 'in_1', status: 'open' });
    const result = await finalizeInvoice.execute({ invoice_id: 'in_1' });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe('open');
    expect(mockFinalize).toHaveBeenCalledWith('in_1', expect.anything());
  });

  it('requires an invoice_id', async () => {
    const result = await finalizeInvoice.execute({});
    expect(result).toContain('Validation error');
  });
});

describe('stripe_invoices_get', () => {
  beforeEach(() => mockRetrieve.mockReset());

  it('retrieves an invoice by id', async () => {
    mockRetrieve.mockResolvedValue({ id: 'in_1', status: 'paid' });
    const result = await getInvoice.execute({ invoice_id: 'in_1' });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('in_1');
  });
});
