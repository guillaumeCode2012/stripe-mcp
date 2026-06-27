import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as getMrr } from './get-mrr.js';
import { toolDefinition as getChurnRate } from './get-churn-rate.js';
import { toolDefinition as getRevenueSummary } from './get-revenue-summary.js';
import { toolDefinition as getTopCustomers } from './get-top-customers.js';
import { toolDefinition as getFailedPaymentsReport } from './get-failed-payments-report.js';

export const tools: ToolDefinition[] = [
  getMrr,
  getChurnRate,
  getRevenueSummary,
  getTopCustomers,
  getFailedPaymentsReport,
];
