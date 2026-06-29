import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createRefund } from './create-refund.js';
import { toolDefinition as getRefund } from './get-refund.js';
import { toolDefinition as listRefunds } from './list-refunds.js';

export const tools: ToolDefinition[] = [createRefund, getRefund, listRefunds];
