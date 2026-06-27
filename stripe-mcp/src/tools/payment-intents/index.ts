import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createPaymentIntent } from './create-payment-intent.js';
import { toolDefinition as getPaymentIntent } from './get-payment-intent.js';
import { toolDefinition as confirmPaymentIntent } from './confirm-payment-intent.js';
import { toolDefinition as cancelPaymentIntent } from './cancel-payment-intent.js';
import { toolDefinition as listPaymentIntents } from './list-payment-intents.js';

export const tools: ToolDefinition[] = [
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  listPaymentIntents,
];
