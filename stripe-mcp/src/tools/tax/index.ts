import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createTaxRate } from './create-tax-rate.js';
import { toolDefinition as getTaxRate } from './get-tax-rate.js';
import { toolDefinition as listTaxRates } from './list-tax-rates.js';

export const tools: ToolDefinition[] = [createTaxRate, getTaxRate, listTaxRates];
