import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as getDispute } from './get-dispute.js';
import { toolDefinition as updateDispute } from './update-dispute.js';
import { toolDefinition as closeDispute } from './close-dispute.js';
import { toolDefinition as listDisputes } from './list-disputes.js';

export const tools: ToolDefinition[] = [getDispute, updateDispute, closeDispute, listDisputes];
