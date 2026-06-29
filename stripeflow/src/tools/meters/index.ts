import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createMeter } from './create-meter.js';
import { toolDefinition as getMeter } from './get-meter.js';
import { toolDefinition as listMeters } from './list-meters.js';

export const tools: ToolDefinition[] = [createMeter, getMeter, listMeters];
