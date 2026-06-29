import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createPaymentLink } from './create-payment-link.js';
import { toolDefinition as getPaymentLink } from './get-payment-link.js';
import { toolDefinition as updatePaymentLink } from './update-payment-link.js';
import { toolDefinition as listPaymentLinks } from './list-payment-links.js';

export const tools: ToolDefinition[] = [
  createPaymentLink,
  getPaymentLink,
  updatePaymentLink,
  listPaymentLinks,
];
