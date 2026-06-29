# Customers

Create, retrieve, update, delete, list, and search Stripe customers. Customer
objects are the anchor for subscriptions, payment methods, invoices, and most
billing activity — every account starts here.

All tools take JSON input (validated by zod) and return either the raw Stripe
object as pretty-printed JSON or a human-readable error string. List tools
auto-paginate through every page and wrap results as
`{ total_count, has_more, data }`.

---

### stripe_customers_create

Create a new customer in Stripe. Use when a new user signs up and needs a
Stripe customer record, or before attaching a payment method or subscription.

**Parameters**

| Param         | Type     | Required | Description                                            |
| ------------- | -------- | -------- | ------------------------------------------------------ |
| `email`       | string   | no       | Customer email address                                 |
| `name`        | string   | no       | Customer full name or business name                    |
| `phone`       | string   | no       | Customer phone number                                  |
| `description` | string   | no       | Internal description shown in the Stripe dashboard     |
| `metadata`    | object   | no       | Arbitrary key-value pairs (keys and values are strings)|
| `address`     | object   | no       | Customer billing address (`line1`, `line2`, `city`, `state`, `postal_code`, `country`) |
| `shipping`    | object   | no       | Shipping info (`name`, `phone`, `address`)             |

**Returns** — the created Stripe Customer object.

**Stripe docs** — https://stripe.com/docs/api/customers/create

---

### stripe_customers_get

Retrieve a single Stripe customer by ID. Use when you need the full customer
object or want to expand related objects (subscriptions, default payment
method).

**Parameters**

| Param         | Type     | Required | Description                                              |
| ------------- | -------- | -------- | -------------------------------------------------------- |
| `customer_id` | string   | yes      | Stripe customer ID (e.g. `cus_1a2b3c`)                   |
| `expand`      | string[] | no       | Fields to expand (`default_payment_method`, `subscriptions`, `sources`, `invoice_settings.default_payment_method`) |

**Returns** — the Stripe Customer object (or a `DeletedCustomer` if deleted).

**Stripe docs** — https://stripe.com/docs/api/customers/retrieve

---

### stripe_customers_update

Update an existing Stripe customer. Use when a customer changes their email,
name, phone, or description, or to attach metadata. Pass an empty string for a
metadata key to unset it.

**Parameters**

| Param         | Type     | Required | Description                                            |
| ------------- | -------- | -------- | ------------------------------------------------------ |
| `customer_id` | string   | yes      | Stripe customer ID to update (e.g. `cus_1a2b3c`)       |
| `email`       | string   | no       | New customer email address                             |
| `name`        | string   | no       | New customer full name or business name                |
| `phone`       | string   | no       | New customer phone number                              |
| `description` | string   | no       | New internal description                               |
| `metadata`    | object   | no       | Arbitrary key-value pairs (empty string unsets a key)  |

**Returns** — the updated Stripe Customer object.

**Stripe docs** — https://stripe.com/docs/api/customers/update

---

### stripe_customers_delete

Permanently delete a Stripe customer. **This cannot be undone** and immediately
cancels any active subscriptions on the customer. Use for GDPR
right-to-be-forgotten requests or test-data cleanup.

**Parameters**

| Param         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| `customer_id` | string | yes      | Stripe customer ID to permanently delete (`cus_...`) |

**Returns** — a Stripe `DeletedCustomer` object (`{ id, deleted: true }`).

**Stripe docs** — https://stripe.com/docs/api/customers/delete

---

### stripe_customers_list

List Stripe customers with auto-pagination. Use when you need to enumerate all
or many customers (dashboards, syncs, reports) or filter by an exact email
match.

**Parameters**

| Param            | Type    | Required | Description                                                         |
| ---------------- | ------- | -------- | ------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size (1-100). Results are auto-paginated up to `max_items`.   |
| `email`          | string  | no       | Exact case-sensitive filter on the customer email field             |
| `starting_after` | string  | no       | Cursor: a customer ID to start after (manual pagination)            |
| `max_items`      | integer | no       | Cap on total returned items (default 1000)                          |

**Returns** — `{ total_count, has_more, data: Customer[] }` where `has_more`
is `true` only if the cap was hit before exhausting all results.

**Stripe docs** — https://stripe.com/docs/api/customers/list

---

### stripe_customers_search

Search Stripe customers using the Stripe Search API. Use when you need partial
matches on name, email, or phone, or when the list endpoint's exact-match
filters are not flexible enough. Search results are eventually consistent.

**Parameters**

| Param   | Type    | Required | Description                                                                          |
| ------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| `query` | string  | yes      | Stripe search query string, e.g. `email:'foo@bar.com'` or `name:'Acme Corp'`         |
| `limit` | integer | no       | Maximum number of results (1-100, default 10)                                        |
| `page`  | string  | no       | Cursor for the next page of search results (use `next_page` from a prior response)   |

**Returns** — a Stripe `SearchResult` envelope with `data` (array of Customer),
`has_more`, and `next_page`.

**Stripe docs** — https://stripe.com/docs/api/customers/search ·
Query language: https://stripe.com/docs/search#search-query-language
