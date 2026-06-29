import type { ToolDefinition } from '../types/index.js';

import { tools as customersTools } from './customers/index.js';
import { tools as productsTools } from './products/index.js';
import { tools as pricesTools } from './prices/index.js';
import { tools as subscriptionsTools } from './subscriptions/index.js';
import { tools as invoicesTools } from './invoices/index.js';
import { tools as paymentIntentsTools } from './payment-intents/index.js';
import { tools as refundsTools } from './refunds/index.js';
import { tools as disputesTools } from './disputes/index.js';
import { tools as webhooksTools } from './webhooks/index.js';
import { tools as couponsTools } from './coupons/index.js';
import { tools as promotionCodesTools } from './promotion-codes/index.js';
import { tools as paymentLinksTools } from './payment-links/index.js';
import { tools as checkoutTools } from './checkout/index.js';
import { tools as billingPortalTools } from './billing-portal/index.js';
import { tools as balanceTools } from './balance/index.js';
import { tools as payoutsTools } from './payouts/index.js';
import { tools as taxTools } from './tax/index.js';
import { tools as metersTools } from './meters/index.js';
import { tools as analyticsTools } from './analytics/index.js';

/**
 * The complete catalogue of StripeFlow tools, in registration order.
 * Categories are grouped logically: core resources first, analytics last.
 */
export const allTools: ToolDefinition[] = [
  ...customersTools,
  ...productsTools,
  ...pricesTools,
  ...subscriptionsTools,
  ...invoicesTools,
  ...paymentIntentsTools,
  ...refundsTools,
  ...disputesTools,
  ...webhooksTools,
  ...couponsTools,
  ...promotionCodesTools,
  ...paymentLinksTools,
  ...checkoutTools,
  ...billingPortalTools,
  ...balanceTools,
  ...payoutsTools,
  ...taxTools,
  ...metersTools,
  ...analyticsTools,
];

export const TOOL_COUNT = allTools.length;
