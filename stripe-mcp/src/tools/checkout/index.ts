import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createCheckoutSession } from './create-checkout-session.js';
import { toolDefinition as getCheckoutSession } from './get-checkout-session.js';
import { toolDefinition as expireCheckoutSession } from './expire-checkout-session.js';
import { toolDefinition as listCheckoutSessions } from './list-checkout-sessions.js';

export const tools: ToolDefinition[] = [
  createCheckoutSession,
  getCheckoutSession,
  expireCheckoutSession,
  listCheckoutSessions,
];
