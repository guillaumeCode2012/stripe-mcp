import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createSubscription } from './create-subscription.js';
import { toolDefinition as getSubscription } from './get-subscription.js';
import { toolDefinition as updateSubscription } from './update-subscription.js';
import { toolDefinition as cancelSubscription } from './cancel-subscription.js';
import { toolDefinition as pauseSubscription } from './pause-subscription.js';
import { toolDefinition as resumeSubscription } from './resume-subscription.js';
import { toolDefinition as listSubscriptions } from './list-subscriptions.js';
import { toolDefinition as searchSubscriptions } from './search-subscriptions.js';

/**
 * Subscription tools — full lifecycle: create, read, update, cancel, pause,
 * resume, list, and search. Ordered to mirror the Stripe API resource.
 */
export const tools: ToolDefinition[] = [
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  listSubscriptions,
  searchSubscriptions,
];
