# Checkout

Create, retrieve, expire, and list Stripe Checkout Sessions. A Checkout
Session is the underlying object behind a Stripe-hosted checkout page — it
binds line items, customer info, success/cancel URLs, and payment intent
configuration. Payment Links create Checkout Sessions on every visit.

All tools validate input with zod and return the Stripe Checkout.Session
object as pretty-printed JSON on success or a human-readable error string on
failure. `stripe_checkout_list_sessions` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_checkout_create_session

Create a Checkout Session for a one-time payment, subscription, or
payment-method setup. Use when you need a hosted Stripe Checkout URL to send
to a customer, are building a "pay now" flow without a custom UI, or want to
start a subscription through hosted checkout.

**Parameters**

| Param                       | Type    | Required | Description                                                                                  |
| --------------------------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `success_url`               | string  | yes      | URL customers are redirected to after successful payment. Use `{CHECKOUT_SESSION_ID}` as a placeholder. |
| `cancel_url`                | string  | yes      | URL customers are redirected to if they cancel checkout                                      |
| `mode`                      | string  | no       | `payment` (one-time) \| `subscription` (recurring) \| `setup` (save a method off-session)    |
| `line_items`                | array   | no       | Array of `{ price: string, quantity: integer }`. Required in payment and subscription modes. |
| `payment_method_types`      | array   | no       | Payment method types to accept (e.g. `["card", "cashapp"]`). Omit to use dashboard defaults. |
| `customer`                  | string  | no       | Existing customer ID to associate with this checkout session                                 |
| `customer_email`            | string  | no       | Email to prefill for new customers (ignored if `customer` is set)                            |
| `metadata`                  | object  | no       | Arbitrary key-value metadata attached to the session                                         |
| `allow_promotion_codes`     | boolean | no       | If `true`, customers can redeem promotion codes at checkout                                  |
| `billing_address_collection`| string  | no       | `auto` \| `required`. Defaults to `auto`.                                                    |
| `tax_id_collection`         | object  | no       | `{ enabled: boolean }` — collect customer tax IDs at checkout                                |
| `automatic_tax`             | object  | no       | `{ enabled: boolean }` — enable Stripe Tax automatic calculation                            |
| `subscription_data`         | object  | no       | Subscription-mode settings (e.g. `{ trial_period_days: 14, metadata: {...} }`). See Stripe docs. |
| `payment_intent_data`       | object  | no       | Payment-mode PaymentIntent settings (e.g. `{ description, statement_descriptor, capture_method }`). See Stripe docs. |

**Returns** — the full Stripe Checkout Session object (id, url,
payment_intent, mode, status).

**Stripe docs** — https://stripe.com/docs/api/checkout/sessions/create

---

### stripe_checkout_get_session

Retrieve a single Checkout Session by its ID. Use when you need to confirm a
session completed and inspect the payment status, retrieve customer details or
line items after redirect, or verify webhook events against the originating
session.

**Parameters**

| Param        | Type     | Required | Description                                                  |
| ------------ | -------- | -------- | ------------------------------------------------------------ |
| `session_id` | string   | yes      | The ID of the Checkout Session to retrieve (e.g. `cs_test_...`) |
| `expand`     | string[] | no       | Fields to expand (e.g. `["line_items", "customer", "payment_intent"]`) |

**Returns** — the full Stripe Checkout Session object (id, status,
payment_status, customer_details, amount_total).

**Stripe docs** — https://stripe.com/docs/api/checkout/sessions/retrieve

---

### stripe_checkout_expire_session

Expire an open Checkout Session so it can no longer be completed by customers.
Use when a customer abandoned checkout and you want to free the inventory or
pricing hold, you need to invalidate a stale session programmatically, or you
are cleaning up sessions as part of an order-cancellation flow.

**Parameters**

| Param        | Type   | Required | Description                                                  |
| ------------ | ------ | -------- | ------------------------------------------------------------ |
| `session_id` | string | yes      | The ID of an open Checkout Session to expire (e.g. `cs_test_...`) |

**Returns** — the expired Stripe Checkout Session object (`status: 'expired'`).

**Stripe docs** — https://stripe.com/docs/api/checkout/sessions/expire

---

### stripe_checkout_list_sessions

List Checkout Sessions, auto-paginating through every page. Use when you need
to find sessions by customer, status, or originating payment link, are
reconciling abandoned vs. completed checkouts, or want to export checkout
activity for reporting.

**Parameters**

| Param            | Type    | Required | Description                                                                                |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`          | integer | no       | Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when `max_items` is omitted. |
| `status`         | string  | no       | Filter by Checkout Session status: `open` \| `complete` \| `expired`                       |
| `payment_link`   | string  | no       | Only return sessions created by this Payment Link ID                                       |
| `customer`       | string  | no       | Only return sessions for this Customer ID                                                  |
| `starting_after` | string  | no       | Cursor: an existing session ID to start pagination after                                   |
| `max_items`      | integer | no       | Hard cap on the total number of sessions returned (defaults to 100,000 if omitted)         |

**Returns** — `{ total_count, has_more, data: Session[] }` with all matching
sessions up to `max_items`.

**Stripe docs** — https://stripe.com/docs/api/checkout/sessions/list
