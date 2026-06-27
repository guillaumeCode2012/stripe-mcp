import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createPayout } from './create-payout.js';
import { toolDefinition as getPayout } from './get-payout.js';
import { toolDefinition as cancelPayout } from './cancel-payout.js';
import { toolDefinition as listPayouts } from './list-payouts.js';

export const tools: ToolDefinition[] = [createPayout, getPayout, cancelPayout, listPayouts];
