/**
 * stripe-mcp tool catalogue.
 *
 * This file is the single source of truth for the landing page's tools table.
 * It mirrors the tool surface shipped by the `stripe-mcp` package
 * (`/stripe-mcp/src/tools`). Each entry matches the on-wire tool name
 * (the exact string an MCP client like Claude Desktop sends).
 *
 * Total: 79 tools across 19 categories.
 */

export type StripeMcpTool = {
  /** Exact tool name, e.g. `stripe_customers_create`. */
  name: string;
  /** Category display name, e.g. `Customers`. Must be a key of `categoryColors`. */
  category: string;
  /** One-line description of what the tool does. */
  description: string;
  /** A natural-language prompt a developer might type to an AI assistant. */
  examplePrompt: string;
};

/**
 * The 19 categories in display order.
 * Order matters — this is the order used by the filter chip row.
 */
export const categories = [
  "Customers",
  "Products",
  "Prices",
  "Subscriptions",
  "Invoices",
  "Payment Intents",
  "Refunds",
  "Disputes",
  "Webhooks",
  "Coupons",
  "Promotion Codes",
  "Payment Links",
  "Checkout",
  "Billing Portal",
  "Balance",
  "Payouts",
  "Tax",
  "Meters",
  "Analytics",
] as const;

/** Tailwind class fragments used to color each category's chip + accent. */
export const categoryColors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  Customers:        { text: "text-violet-300",    bg: "bg-violet-500/10",    border: "border-violet-500/25",    dot: "bg-violet-400" },
  Products:         { text: "text-emerald-300",   bg: "bg-emerald-500/10",   border: "border-emerald-500/25",   dot: "bg-emerald-400" },
  Prices:           { text: "text-emerald-300",   bg: "bg-emerald-500/10",   border: "border-emerald-500/25",   dot: "bg-emerald-400" },
  Subscriptions:    { text: "text-violet-300",    bg: "bg-violet-500/10",    border: "border-violet-500/25",    dot: "bg-violet-400" },
  Invoices:         { text: "text-amber-300",     bg: "bg-amber-500/10",     border: "border-amber-500/25",     dot: "bg-amber-400" },
  "Payment Intents":{ text: "text-rose-300",      bg: "bg-rose-500/10",      border: "border-rose-500/25",      dot: "bg-rose-400" },
  Refunds:          { text: "text-rose-300",      bg: "bg-rose-500/10",      border: "border-rose-500/25",      dot: "bg-rose-400" },
  Disputes:         { text: "text-rose-300",      bg: "bg-rose-500/10",      border: "border-rose-500/25",      dot: "bg-rose-400" },
  Webhooks:         { text: "text-sky-300",       bg: "bg-sky-500/10",       border: "border-sky-500/25",       dot: "bg-sky-400" },
  Coupons:          { text: "text-fuchsia-300",   bg: "bg-fuchsia-500/10",   border: "border-fuchsia-500/25",   dot: "bg-fuchsia-400" },
  "Promotion Codes":{ text: "text-fuchsia-300",   bg: "bg-fuchsia-500/10",   border: "border-fuchsia-500/25",   dot: "bg-fuchsia-400" },
  "Payment Links":  { text: "text-teal-300",      bg: "bg-teal-500/10",      border: "border-teal-500/25",      dot: "bg-teal-400" },
  Checkout:         { text: "text-teal-300",      bg: "bg-teal-500/10",      border: "border-teal-500/25",      dot: "bg-teal-400" },
  "Billing Portal": { text: "text-teal-300",      bg: "bg-teal-500/10",      border: "border-teal-500/25",      dot: "bg-teal-400" },
  Balance:          { text: "text-emerald-300",   bg: "bg-emerald-500/10",   border: "border-emerald-500/25",   dot: "bg-emerald-400" },
  Payouts:          { text: "text-amber-300",     bg: "bg-amber-500/10",     border: "border-amber-500/25",     dot: "bg-amber-400" },
  Tax:              { text: "text-cyan-300",      bg: "bg-cyan-500/10",      border: "border-cyan-500/25",      dot: "bg-cyan-400" },
  Meters:           { text: "text-lime-300",      bg: "bg-lime-500/10",      border: "border-lime-500/25",      dot: "bg-lime-400" },
  Analytics:        { text: "text-violet-300",    bg: "bg-violet-500/10",    border: "border-violet-500/25",    dot: "bg-violet-400" },
};

export const stripeMcpTools: StripeMcpTool[] = [
  // ── Customers (6) ──────────────────────────────────────────────────────
  {
    name: "stripe_customers_create",
    category: "Customers",
    description: "Create a new customer with email, name, and optional metadata.",
    examplePrompt: "Create a customer named Sarah Chen with email sarah@acme.io and metadata company=Acme",
  },
  {
    name: "stripe_customers_get",
    category: "Customers",
    description: "Retrieve a customer by ID, including default payment method and subscriptions.",
    examplePrompt: "Show me everything about customer cus_NL9x4two3q8aR2",
  },
  {
    name: "stripe_customers_update",
    category: "Customers",
    description: "Update a customer's email, name, address, shipping, or metadata.",
    examplePrompt: "Update cus_NL9x4two3q8aR2 to add a shipping address in Berlin",
  },
  {
    name: "stripe_customers_delete",
    category: "Customers",
    description: "Permanently delete a customer. Detaches all payment methods; cannot be undone.",
    examplePrompt: "Delete cus_NL9x4two3q8aR2 — I confirmed they churned",
  },
  {
    name: "stripe_customers_list",
    category: "Customers",
    description: "List customers with optional filters (email, created), auto-paginated.",
    examplePrompt: "List all customers created in the last 30 days",
  },
  {
    name: "stripe_customers_search",
    category: "Customers",
    description: "Search customers using Stripe's full-text query syntax (name, email, metadata).",
    examplePrompt: "Find any customer whose email contains 'acme.io'",
  },

  // ── Products (5) ───────────────────────────────────────────────────────
  {
    name: "stripe_products_create",
    category: "Products",
    description: "Create a product with a name, description, and optional images.",
    examplePrompt: "Create a product called 'Pro Plan' for our SaaS subscription",
  },
  {
    name: "stripe_products_get",
    category: "Products",
    description: "Retrieve a product including its active status and default price.",
    examplePrompt: "Get the details of product prod_Abc123xyz",
  },
  {
    name: "stripe_products_update",
    category: "Products",
    description: "Update a product's name, description, images, or active flag.",
    examplePrompt: "Rename product prod_Abc123xyz to 'Pro Plan Annual'",
  },
  {
    name: "stripe_products_archive",
    category: "Products",
    description: "Deactivate a product so it can no longer be sold. Existing subs are unaffected.",
    examplePrompt: "Archive product prod_Abc123xyz — we're discontinuing it",
  },
  {
    name: "stripe_products_list",
    category: "Products",
    description: "List all products with optional active filter, paginated.",
    examplePrompt: "List all active products in our catalog",
  },

  // ── Prices (4) ─────────────────────────────────────────────────────────
  {
    name: "stripe_prices_create",
    category: "Prices",
    description: "Create a price (one-time or recurring) in any supported currency.",
    examplePrompt: "Create a $49/month recurring price for product prod_Abc123xyz",
  },
  {
    name: "stripe_prices_get",
    category: "Prices",
    description: "Retrieve a price including currency, unit amount, and recurring interval.",
    examplePrompt: "Show me price price_1Abc234xyz",
  },
  {
    name: "stripe_prices_update",
    category: "Prices",
    description: "Update a price's nickname, active flag, or metadata. Amount cannot change.",
    examplePrompt: "Mark price price_1Abc234xyz as inactive",
  },
  {
    name: "stripe_prices_list",
    category: "Prices",
    description: "List prices with optional product filter, paginated.",
    examplePrompt: "List all prices for product prod_Abc123xyz",
  },

  // ── Subscriptions (8) ──────────────────────────────────────────────────
  {
    name: "stripe_subscriptions_create",
    category: "Subscriptions",
    description: "Subscribe a customer to a price, optionally with a trial or coupon.",
    examplePrompt: "Subscribe cus_NL9x4two3q8aR2 to the Pro plan with a 14-day trial",
  },
  {
    name: "stripe_subscriptions_get",
    category: "Subscriptions",
    description: "Retrieve a subscription's status, current period, items, and discount.",
    examplePrompt: "Show me subscription sub_1Abc234xyz",
  },
  {
    name: "stripe_subscriptions_update",
    category: "Subscriptions",
    description: "Update a subscription's items, proration behavior, trial end, or metadata.",
    examplePrompt: "Upgrade sub_1Abc234xyz to the annual plan, prorating the difference",
  },
  {
    name: "stripe_subscriptions_cancel",
    category: "Subscriptions",
    description: "Cancel a subscription immediately or at period end.",
    examplePrompt: "Cancel sub_1Abc234xyz at the end of the current billing period",
  },
  {
    name: "stripe_subscriptions_pause",
    category: "Subscriptions",
    description: "Pause a subscription's collection (void or mark_uncollectible).",
    examplePrompt: "Pause sub_1Abc234xyz until I tell you to resume",
  },
  {
    name: "stripe_subscriptions_resume",
    category: "Subscriptions",
    description: "Resume a previously paused subscription.",
    examplePrompt: "Resume sub_1Abc234xyz — the customer is back",
  },
  {
    name: "stripe_subscriptions_list",
    category: "Subscriptions",
    description: "List subscriptions with optional status or customer filter, paginated.",
    examplePrompt: "List all active subscriptions",
  },
  {
    name: "stripe_subscriptions_search",
    category: "Subscriptions",
    description: "Search subscriptions by status or price using Stripe's query syntax.",
    examplePrompt: "Find all subscriptions on price price_1Abc234xyz",
  },

  // ── Invoices (6) ───────────────────────────────────────────────────────
  {
    name: "stripe_invoices_get",
    category: "Invoices",
    description: "Retrieve an invoice including line items, totals, tax, and finalization status.",
    examplePrompt: "Show me invoice in_1Abc234xyz",
  },
  {
    name: "stripe_invoices_list",
    category: "Invoices",
    description: "List invoices with optional customer or status filter, paginated.",
    examplePrompt: "List all open invoices for cus_NL9x4two3q8aR2",
  },
  {
    name: "stripe_invoices_pay",
    category: "Invoices",
    description: "Pay an open invoice immediately using the customer's default payment method.",
    examplePrompt: "Pay invoice in_1Abc234xyz now",
  },
  {
    name: "stripe_invoices_void",
    category: "Invoices",
    description: "Mark an invoice as void. Cannot be undone.",
    examplePrompt: "Void invoice in_1Abc234xyz — it was a mistake",
  },
  {
    name: "stripe_invoices_finalize",
    category: "Invoices",
    description: "Finalize a draft invoice so it can be paid or sent.",
    examplePrompt: "Finalize invoice in_1Abc234xyz so we can send it",
  },
  {
    name: "stripe_invoices_send",
    category: "Invoices",
    description: "Email an invoice to the customer.",
    examplePrompt: "Send invoice in_1Abc234xyz to the customer now",
  },

  // ── Payment Intents (5) ────────────────────────────────────────────────
  {
    name: "stripe_payment_intents_create",
    category: "Payment Intents",
    description: "Create a PaymentIntent to collect a one-time payment from a customer.",
    examplePrompt: "Create a payment intent for $129.99 USD",
  },
  {
    name: "stripe_payment_intents_get",
    category: "Payment Intents",
    description: "Retrieve a PaymentIntent's status, amount, and last payment error.",
    examplePrompt: "Show me payment intent pi_1Abc234xyz",
  },
  {
    name: "stripe_payment_intents_confirm",
    category: "Payment Intents",
    description: "Confirm a PaymentIntent to attempt payment capture.",
    examplePrompt: "Confirm payment intent pi_1Abc234xyz",
  },
  {
    name: "stripe_payment_intents_cancel",
    category: "Payment Intents",
    description: "Cancel a PaymentIntent that hasn't been captured yet.",
    examplePrompt: "Cancel payment intent pi_1Abc234xyz",
  },
  {
    name: "stripe_payment_intents_list",
    category: "Payment Intents",
    description: "List PaymentIntents with optional customer or status filter, paginated.",
    examplePrompt: "List all PaymentIntents created in the last 7 days",
  },

  // ── Refunds (3) ────────────────────────────────────────────────────────
  {
    name: "stripe_refunds_create",
    category: "Refunds",
    description: "Refund a charge, partially or in full. May take several days to appear.",
    examplePrompt: "Refund $25 from charge ch_1Abc234xyz — the customer was overcharged",
  },
  {
    name: "stripe_refunds_get",
    category: "Refunds",
    description: "Retrieve a refund's amount, status, and reason.",
    examplePrompt: "Show me refund re_1Abc234xyz",
  },
  {
    name: "stripe_refunds_list",
    category: "Refunds",
    description: "List refunds with optional charge or payment intent filter, paginated.",
    examplePrompt: "List all refunds issued in the last 30 days",
  },

  // ── Disputes (4) ───────────────────────────────────────────────────────
  {
    name: "stripe_disputes_get",
    category: "Disputes",
    description: "Retrieve a dispute's amount, reason, status, and evidence deadlines.",
    examplePrompt: "Show me dispute dp_1Abc234xyz",
  },
  {
    name: "stripe_disputes_update",
    category: "Disputes",
    description: "Submit evidence or update metadata for a dispute.",
    examplePrompt: "Update dispute dp_1Abc234xyz with shipping tracking evidence",
  },
  {
    name: "stripe_disputes_close",
    category: "Disputes",
    description: "Close a dispute, conceding it. Cannot be reopened.",
    examplePrompt: "Close dispute dp_1Abc234xyz — we'll accept the chargeback",
  },
  {
    name: "stripe_disputes_list",
    category: "Disputes",
    description: "List disputes with optional status or payment intent filter, paginated.",
    examplePrompt: "List all open disputes that need evidence",
  },

  // ── Webhooks (5) ───────────────────────────────────────────────────────
  {
    name: "stripe_webhooks_create",
    category: "Webhooks",
    description: "Register a webhook endpoint to receive Stripe events.",
    examplePrompt: "Create a webhook for https://acme.io/stripe-webhook that listens for invoice.payment_failed",
  },
  {
    name: "stripe_webhooks_get",
    category: "Webhooks",
    description: "Retrieve a webhook endpoint's URL, enabled events, and signing secret.",
    examplePrompt: "Show me webhook endpoint we_1Abc234xyz",
  },
  {
    name: "stripe_webhooks_update",
    category: "Webhooks",
    description: "Update a webhook's URL, enabled events, or disabled flag.",
    examplePrompt: "Disable webhook endpoint we_1Abc234xyz",
  },
  {
    name: "stripe_webhooks_delete",
    category: "Webhooks",
    description: "Permanently delete a webhook endpoint.",
    examplePrompt: "Delete webhook endpoint we_1Abc234xyz — we migrated off it",
  },
  {
    name: "stripe_webhooks_list",
    category: "Webhooks",
    description: "List all webhook endpoints for the account, paginated.",
    examplePrompt: "List all webhook endpoints we have configured",
  },

  // ── Coupons (4) ────────────────────────────────────────────────────────
  {
    name: "stripe_coupons_create",
    category: "Coupons",
    description: "Create a coupon with a percentage or fixed amount off, valid for some duration.",
    examplePrompt: "Create a 50% off coupon valid for 3 months called SPRING50",
  },
  {
    name: "stripe_coupons_get",
    category: "Coupons",
    description: "Retrieve a coupon's duration, percent off, and redemption count.",
    examplePrompt: "Show me coupon SPRING50",
  },
  {
    name: "stripe_coupons_delete",
    category: "Coupons",
    description: "Delete a coupon. Existing redemptions are unaffected.",
    examplePrompt: "Delete coupon SPRING50 — the promo is over",
  },
  {
    name: "stripe_coupons_list",
    category: "Coupons",
    description: "List all coupons for the account, paginated.",
    examplePrompt: "List all coupons we currently have",
  },

  // ── Promotion Codes (3) ────────────────────────────────────────────────
  {
    name: "stripe_promotion_codes_create",
    category: "Promotion Codes",
    description: "Create a customer-facing promotion code from an existing coupon.",
    examplePrompt: "Create a promotion code SPRING2025 from coupon SPRING50",
  },
  {
    name: "stripe_promotion_codes_get",
    category: "Promotion Codes",
    description: "Retrieve a promotion code including its coupon and redemption limits.",
    examplePrompt: "Show me promotion code promo_1Abc234xyz",
  },
  {
    name: "stripe_promotion_codes_list",
    category: "Promotion Codes",
    description: "List promotion codes with optional active or coupon filter, paginated.",
    examplePrompt: "List all active promotion codes",
  },

  // ── Payment Links (4) ──────────────────────────────────────────────────
  {
    name: "stripe_payment_links_create",
    category: "Payment Links",
    description: "Create a shareable Payment Link URL customers use to pay.",
    examplePrompt: "Create a payment link for the Pro plan price",
  },
  {
    name: "stripe_payment_links_get",
    category: "Payment Links",
    description: "Retrieve a Payment Link including its URL and line items.",
    examplePrompt: "Show me payment link plink_1Abc234xyz",
  },
  {
    name: "stripe_payment_links_update",
    category: "Payment Links",
    description: "Update a Payment Link's active flag or line items.",
    examplePrompt: "Deactivate payment link plink_1Abc234xyz",
  },
  {
    name: "stripe_payment_links_list",
    category: "Payment Links",
    description: "List all Payment Links for the account, paginated.",
    examplePrompt: "List all our active payment links",
  },

  // ── Checkout (4) ───────────────────────────────────────────────────────
  {
    name: "stripe_checkout_create_session",
    category: "Checkout",
    description: "Create a Checkout Session for a one-time or recurring payment.",
    examplePrompt: "Create a checkout session for the annual Pro plan, $490/year",
  },
  {
    name: "stripe_checkout_get_session",
    category: "Checkout",
    description: "Retrieve a Checkout Session including its status and customer.",
    examplePrompt: "Show me checkout session cs_test_1Abc234xyz",
  },
  {
    name: "stripe_checkout_expire_session",
    category: "Checkout",
    description: "Expire an open Checkout Session so it can no longer be used.",
    examplePrompt: "Expire checkout session cs_test_1Abc234xyz",
  },
  {
    name: "stripe_checkout_list_sessions",
    category: "Checkout",
    description: "List Checkout Sessions with optional status filter, paginated.",
    examplePrompt: "List all open checkout sessions from today",
  },

  // ── Billing Portal (1) ─────────────────────────────────────────────────
  {
    name: "stripe_billing_portal_create_session",
    category: "Billing Portal",
    description: "Create a portal URL where a customer manages their own subscription and cards.",
    examplePrompt: "Give cus_NL9x4two3q8aR2 a billing portal link so they can update their card",
  },

  // ── Balance (2) ────────────────────────────────────────────────────────
  {
    name: "stripe_balance_get",
    category: "Balance",
    description: "Retrieve the account's current available and pending balance.",
    examplePrompt: "What's our current Stripe balance?",
  },
  {
    name: "stripe_balance_list_transactions",
    category: "Balance",
    description: "List balance transactions (charges, fees, payouts, refunds).",
    examplePrompt: "List the last 20 balance transactions",
  },

  // ── Payouts (4) ────────────────────────────────────────────────────────
  {
    name: "stripe_payouts_create",
    category: "Payouts",
    description: "Manually initiate a payout to the bank, up to the available balance.",
    examplePrompt: "Payout $5,000 to our bank account now",
  },
  {
    name: "stripe_payouts_get",
    category: "Payouts",
    description: "Retrieve a payout's amount, status, and arrival date.",
    examplePrompt: "Show me payout po_1Abc234xyz",
  },
  {
    name: "stripe_payouts_cancel",
    category: "Payouts",
    description: "Cancel a payout that hasn't been submitted to the bank yet.",
    examplePrompt: "Cancel payout po_1Abc234xyz",
  },
  {
    name: "stripe_payouts_list",
    category: "Payouts",
    description: "List payouts with optional status filter, paginated.",
    examplePrompt: "List all pending payouts",
  },

  // ── Tax (3) ────────────────────────────────────────────────────────────
  {
    name: "stripe_tax_create_rate",
    category: "Tax",
    description: "Create a tax rate applicable to invoices, subscriptions, or Checkout.",
    examplePrompt: "Create a 7% California sales tax rate",
  },
  {
    name: "stripe_tax_get_rate",
    category: "Tax",
    description: "Retrieve a tax rate's percentage, inclusivity, and active flag.",
    examplePrompt: "Show me tax rate txr_1Abc234xyz",
  },
  {
    name: "stripe_tax_list_rates",
    category: "Tax",
    description: "List all tax rates for the account, paginated.",
    examplePrompt: "List all active tax rates",
  },

  // ── Meters (3) ─────────────────────────────────────────────────────────
  {
    name: "stripe_meters_create",
    category: "Meters",
    description: "Create a meter for usage-based billing — events are summed per customer per period.",
    examplePrompt: "Create a meter called 'api_calls' to bill by request count",
  },
  {
    name: "stripe_meters_get",
    category: "Meters",
    description: "Retrieve a meter's display name, event time window, and status.",
    examplePrompt: "Show me meter mtr_1Abc234xyz",
  },
  {
    name: "stripe_meters_list",
    category: "Meters",
    description: "List all meters for the account, paginated.",
    examplePrompt: "List all our meters",
  },

  // ── Analytics (5) — the crown jewel ────────────────────────────────────
  {
    name: "stripe_analytics_get_mrr",
    category: "Analytics",
    description: "Compute Monthly Recurring Revenue by summing active subscription items, by plan.",
    examplePrompt: "Show me my MRR and which plan is growing fastest",
  },
  {
    name: "stripe_analytics_get_churn_rate",
    category: "Analytics",
    description: "Compute churn rate over a window from canceled vs. active subscriptions.",
    examplePrompt: "What was our churn rate last month?",
  },
  {
    name: "stripe_analytics_get_revenue_summary",
    category: "Analytics",
    description: "Produce a revenue summary — gross, net, refunds, fees — over a date range.",
    examplePrompt: "Give me a revenue summary for Q3",
  },
  {
    name: "stripe_analytics_get_top_customers",
    category: "Analytics",
    description: "Rank customers by lifetime gross revenue, returning name, email, total spent.",
    examplePrompt: "Who are my top 10 customers by lifetime value?",
  },
  {
    name: "stripe_analytics_get_failed_payments_report",
    category: "Analytics",
    description: "Report failed payment attempts in a window with failure reasons and customers.",
    examplePrompt: "List all failed payments from last 30 days with failure reasons",
  },
];

/** Sanity guard: keep this in sync with reality. */
export const TOOL_COUNT = stripeMcpTools.length; // 79
