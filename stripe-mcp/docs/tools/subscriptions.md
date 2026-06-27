# Subscriptions

Create, retrieve, update, cancel, pause, resume, list, and search Stripe
subscriptions. Subscriptions are the core recurring-billing primitive — they
bind a customer to one or more recurring prices and drive invoice generation
on each billing cycle.

All tools validate input with zod and return the Stripe Subscription object as
pretty-printed JSON on success or a human-readable error string on failure.
List tools auto-paginate and wrap results as `{ total_count, has_more, data }`.

---

### stripe_subscriptions_create

Create a new subscription for a customer. Use when a customer upgrades to a
paid plan, you need to start recurring billing, or you want to add a new line
item to recurring billing.

**Parameters**

| Param                   | Type     | Required | Description                                                                  |
| ----------------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `customer`              | string   | yes      | ID of the customer to subscribe (`cus_...`)                                  |
| `items`                 | array    | yes      | Array of `{ price: string, quantity?: integer }` binding a Price to a count |
| `coupon`                | string   | no       | ID of a coupon to apply (`coupon_...` or promotion code)                     |
| `trial_period_days`     | integer  | no       | Days to trial before the first charge. Overrides any price-level trial.      |
| `metadata`              | object   | no       | Arbitrary key-value metadata (max 50 keys)                                   |
| `default_payment_method`| string   | no       | ID of the PaymentMethod to use as default (`pm_...`)                         |
| `proration_behavior`    | string   | no       | `none` \| `create_prorations` \| `always_invoice`. Defaults to `create_prorations`. |
| `expand`                | string[] | no       | Stripe expandable fields (e.g. `["latest_invoice", "customer"]`)             |

**Returns** — the created Stripe Subscription object.

**Stripe docs** — https://stripe.com/docs/api/subscriptions/create

---

### stripe_subscriptions_get

Retrieve a subscription by ID. Use when you need to inspect a subscription's
status, items, or billing cycle, or to verify the current state before
updating or canceling.

**Parameters**

| Param             | Type     | Required | Description                                                |
| ----------------- | -------- | -------- | ---------------------------------------------------------- |
| `subscription_id` | string   | yes      | ID of the subscription to retrieve (`sub_...`)             |
| `expand`          | string[] | no       | Stripe expandable fields (e.g. `["customer", "latest_invoice.payment_intent"]`) |

**Returns** — the Stripe Subscription object.

**Stripe docs** — https://stripe.com/docs/api/subscriptions/retrieve

---

### stripe_subscriptions_update

Update an existing subscription. Use when upgrading/downgrading a customer's
plan, changing item quantities, applying or removing a coupon, or scheduling
cancellation at period end.

**Parameters**

| Param                   | Type     | Required | Description                                                                  |
| ----------------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `subscription_id`       | string   | yes      | ID of the subscription to update (`sub_...`)                                 |
| `items`                 | array    | no       | Subscription items to add/update/remove. Each item: `{ id?: string, price?: string, quantity?: integer, deleted?: boolean }` |
| `coupon`                | string   | no       | ID of a coupon to apply (pass empty string to clear)                         |
| `proration_behavior`    | string   | no       | `none` \| `create_prorations` \| `always_invoice`                            |
| `metadata`              | object   | no       | Arbitrary key-value metadata (max 50 keys)                                   |
| `default_payment_method`| string   | no       | ID of the PaymentMethod to use as default (`pm_...`)                         |
| `cancel_at_period_end`  | boolean  | no       | If `true`, the subscription cancels at the end of the current period         |
| `expand`                | string[] | no       | Stripe expandable fields (e.g. `["latest_invoice"]`)                         |

**Returns** — the updated Stripe Subscription object.

**Stripe docs** — https://stripe.com/docs/api/subscriptions/update

---

### stripe_subscriptions_cancel

Cancel a subscription immediately. Use when a customer churns, requests
immediate cancellation, or you need to halt recurring billing on a disputed
subscription.

**Parameters**

| Param                 | Type     | Required | Description                                                                                |
| --------------------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| `subscription_id`     | string   | yes      | ID of the subscription to cancel (`sub_...`)                                               |
| `prorate`             | boolean  | no       | If `true`, generate a proration invoice item for unused time. Defaults to `false`.         |
| `invoice_now`         | boolean  | no       | If `true`, generate a final invoice for un-invoiced metered usage. Defaults to `false`.    |
| `cancellation_details`| object   | no       | `{ comment?: string, feedback?: 'customer_service'\|'low_quality'\|'missing_features'\|'other'\|'switched_service'\|'too_complex'\|'too_expensive'\|'unused' }` |
| `expand`              | string[] | no       | Stripe expandable fields (e.g. `["customer"]`)                                             |

**Returns** — the canceled Stripe Subscription object (`status: 'canceled'`).

**Stripe docs** — https://stripe.com/docs/api/subscriptions/cancel

---

### stripe_subscriptions_pause

Pause a subscription's collection cycle. Use when a customer temporarily
suspends service (vacation, seasonal), you want to stop billing without
canceling, or for trial-extension scenarios. Behind the scenes this calls
`subscriptions.update` with `pause_collection`.

Only available for subscriptions using `charge_automatically` collection.

**Parameters**

| Param             | Type    | Required | Description                                                                                |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `subscription_id` | string  | yes      | ID of the subscription to pause (`sub_...`)                                                |
| `behavior`        | string  | no       | How to handle invoices while paused: `void` \| `mark_uncollectible` \| `keep_as_draft`. Defaults to `void`. |
| `resumes_at`      | integer | no       | Unix timestamp (seconds) when the subscription should automatically resume                |

**Returns** — the updated Stripe Subscription object (with `pause_collection` populated).

**Stripe docs** — https://stripe.com/docs/billing/subscriptions/pause

---

### stripe_subscriptions_resume

Resume a paused subscription. Use when a customer returns from a paused state,
the `resumes_at` time arrives and you want to resume early, or you're
re-activating after a billing holiday.

Only available for subscriptions using `charge_automatically` collection.

**Parameters**

| Param                  | Type     | Required | Description                                                                |
| ---------------------- | -------- | -------- | -------------------------------------------------------------------------- |
| `subscription_id`      | string   | yes      | ID of the paused subscription to resume (`sub_...`)                        |
| `billing_cycle_anchor` | string   | no       | `now` \| `unchanged`. Whether to reset the billing cycle anchor. Defaults to `now`. |
| `proration_behavior`   | string   | no       | `none` \| `create_prorations` \| `always_invoice`. Defaults to `create_prorations`. |
| `expand`               | string[] | no       | Stripe expandable fields (e.g. `["latest_invoice"]`)                       |

**Returns** — the resumed Stripe Subscription object (`status: 'active'`).

**Stripe docs** — https://stripe.com/docs/api/subscriptions/resume

---

### stripe_subscriptions_list

List subscriptions with optional filters. Use when showing a customer's
subscriptions, finding past_due or unpaid subscriptions for recovery
workflows, or auditing active subscriptions across the account.

**Parameters**

| Param                  | Type    | Required | Description                                                                                |
| ---------------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`                | integer | no       | Page size for each Stripe request (1-100)                                                  |
| `status`               | string  | no       | `active` \| `past_due` \| `canceled` \| `unpaid` \| `all` \| `trialing` \| `incomplete` \| `incomplete_expired` \| `paused` |
| `customer`             | string  | no       | Only return subscriptions for this customer (`cus_...`)                                    |
| `price`                | string  | no       | Only return subscriptions that contain this Price ID (`price_...`)                         |
| `current_period_end`   | integer | no       | Unix timestamp (seconds) filter on current period end                                      |
| `starting_after`       | string  | no       | Pagination cursor — ID of the last object from the previous page                           |
| `max_items`            | integer | no       | Hard cap on total items returned. Defaults to 1000.                                        |

**Returns** — `{ total_count, has_more, data: Subscription[] }`.

**Stripe docs** — https://stripe.com/docs/api/subscriptions/list

---

### stripe_subscriptions_search

Search subscriptions using Stripe Search Query Language. Use when looking up
subscriptions by metadata, status, or plan attributes, or for dashboard-style
filtered views. Search results are eventually consistent (not for
read-after-write flows).

**Parameters**

| Param    | Type     | Required | Description                                                                              |
| -------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `query`  | string   | yes      | Stripe Search Query Language string. Supported fields: `status`, `customer`, `plan.id`, `price.id`, `metadata.<key>`. |
| `limit`  | integer  | no       | Maximum number of results (1-100). Defaults to 10.                                       |
| `expand` | string[] | no       | Stripe expandable fields (e.g. `["data.customer"]`)                                      |

**Returns** — `{ total_count, has_more, data: Subscription[] }`. Note: Stripe
search uses `next_page` pagination; this tool returns the first page only
(intentionally not auto-paginated to keep search responsive).

**Stripe docs** — https://stripe.com/docs/api/subscriptions/search ·
Query language: https://stripe.com/docs/search#search-query-language
