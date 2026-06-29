import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as getBalance } from './get-balance.js';
import { toolDefinition as listBalanceTransactions } from './list-balance-transactions.js';

export const tools: ToolDefinition[] = [getBalance, listBalanceTransactions];
