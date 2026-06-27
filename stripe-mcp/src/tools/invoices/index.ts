import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as getInvoice } from './get-invoice.js';
import { toolDefinition as listInvoices } from './list-invoices.js';
import { toolDefinition as payInvoice } from './pay-invoice.js';
import { toolDefinition as voidInvoice } from './void-invoice.js';
import { toolDefinition as finalizeInvoice } from './finalize-invoice.js';
import { toolDefinition as sendInvoice } from './send-invoice.js';

/**
 * Invoice tools — lifecycle from retrieval/listing through finalization,
 * payment, emailing, and voiding. Ordered to mirror common billing flows.
 */
export const tools: ToolDefinition[] = [
  getInvoice,
  listInvoices,
  payInvoice,
  voidInvoice,
  finalizeInvoice,
  sendInvoice,
];
