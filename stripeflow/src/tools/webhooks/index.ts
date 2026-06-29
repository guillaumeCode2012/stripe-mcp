import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createWebhook } from './create-webhook.js';
import { toolDefinition as getWebhook } from './get-webhook.js';
import { toolDefinition as updateWebhook } from './update-webhook.js';
import { toolDefinition as deleteWebhook } from './delete-webhook.js';
import { toolDefinition as listWebhooks } from './list-webhooks.js';

export const tools: ToolDefinition[] = [
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  listWebhooks,
];
