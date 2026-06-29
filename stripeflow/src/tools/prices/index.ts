import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createPrice } from './create-price.js';
import { toolDefinition as getPrice } from './get-price.js';
import { toolDefinition as updatePrice } from './update-price.js';
import { toolDefinition as listPrices } from './list-prices.js';

export const tools: ToolDefinition[] = [createPrice, getPrice, updatePrice, listPrices];
