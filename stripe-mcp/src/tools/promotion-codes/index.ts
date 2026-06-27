import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createPromotionCode } from './create-promotion-code.js';
import { toolDefinition as getPromotionCode } from './get-promotion-code.js';
import { toolDefinition as listPromotionCodes } from './list-promotion-codes.js';

export const tools: ToolDefinition[] = [createPromotionCode, getPromotionCode, listPromotionCodes];
