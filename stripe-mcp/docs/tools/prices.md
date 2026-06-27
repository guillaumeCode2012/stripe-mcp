# Prices

Create, retrieve, update, and list Stripe prices. Prices attach to products and
define the actual amount, currency, and recurrence (one-time or recurring) the
customer pays. Subscriptions require a recurring price; one-time purchases use
a one-time price.

All tools validate input with zod and return the Stripe Price object as
pretty-printed JSON on success or a human-readable error string on failure.

---

### stripe_prices_create

Create a new Price in Stripe. Use when you want to charge a fixed amount for a
product (one-time or recurring) or when adding a new pricing tier (e.g. monthly
vs yearly) for an existing product. You must provide exactly one of `product`
(existing product ID) or `product_data` (to create a new product inline).

**Parameters**

| Param           | Type    | Required | Description                                                                         |
| --------------- | ------- | -------- | ----------------------------------------------------------------------------------- |
| `unit_amount`   | integer | yes      | Price amount in the smallest currency unit (e.g. cents for USD). 0 for a free price.|
| `currency`      | string  | yes      | Lowercase 3-letter ISO currency code (e.g. `usd`, `eur`, `jpy`)                    |
| `product`       | string  | no*      | ID of an existing product this price belongs to (`prod_...`). *One of `product` or `product_data` is required.* |
| `product_data`  | object  | no*      | Inline new-product config (`{ name: string }`). Mutually exclusive with `product`.  |
| `recurring`     | object  | no       | Recurring price config. Omit for a one-time price. `{ interval: 'day'\|'week'\|'month'\|'year', interval_count?: integer }` |
| `nickname`      | string  | no       | Internal nickname for the price (hidden from customers)                            |
| `lookup_key`    | string  | no       | Lookup key used to retrieve prices dynamically from a static string                |
| `metadata`      | object  | no       | Arbitrary key-value pairs (keys and values are strings)                             |
| `active`        | boolean | no       | Whether the price can be used for new purchases. Defaults to `true`.               |

**Returns** — the created Stripe Price object.

**Stripe docs** — https://stripe.com/docs/api/prices/create

---

### stripe_prices_get

Retrieve a single Stripe price by ID. Use when you need the full Price object
(amount, currency, recurring config, product link) or want to expand the
related Product object.

**Parameters**

| Param      | Type     | Required | Description                                              |
| ---------- | -------- | -------- | -------------------------------------------------------- |
| `price_id` | string   | yes      | Stripe price ID (e.g. `price_1a2b3c`)                    |
| `expand`   | string[] | no       | Fields to expand. Commonly useful: `product`, `tiers`.   |

**Returns** — the Stripe Price object.

**Stripe docs** — https://stripe.com/docs/api/prices/retrieve

---

### stripe_prices_update

Update an existing Stripe price. Use to rename (nick) a price, set/update a
lookup key, or deactivate a price so it can't be used for new purchases
(without deleting it). **Stripe does not allow updating `unit_amount`,
`currency`, `recurring`, or `product` on an existing price** — create a new
price instead.

**Parameters**

| Param        | Type    | Required | Description                                                                |
| ------------ | ------- | -------- | -------------------------------------------------------------------------- |
| `price_id`   | string  | yes      | Stripe price ID to update (e.g. `price_1a2b3c`)                            |
| `nickname`   | string  | no       | New internal nickname for the price (hidden from customers)                |
| `lookup_key` | string  | no       | New lookup key. Pass an empty string to unset.                             |
| `metadata`   | object  | no       | Arbitrary key-value pairs (empty string unsets a key)                      |
| `active`     | boolean | no       | Whether the price can be used for new purchases                            |

**Returns** — the updated Stripe Price object.

**Stripe docs** — https://stripe.com/docs/api/prices/update

---

### stripe_prices_list

List Stripe prices with auto-pagination. Use when you need to enumerate all or
many prices (pricing page, sync) or filter by active status, product, or type
(one_time / recurring).

**Parameters**

| Param            | Type    | Required | Description                                                          |
| ---------------- | ------- | -------- | -------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size (1-100). Results are auto-paginated up to `max_items`.     |
| `active`         | boolean | no       | Filter: only return active (`true`) or inactive (`false`) prices     |
| `product`        | string  | no       | Only return prices for this product ID (`prod_...`)                  |
| `type`           | string  | no       | Filter by price type: `one_time` or `recurring`                      |
| `starting_after` | string  | no       | Cursor: a price ID to start after (manual pagination)                |
| `max_items`      | integer | no       | Cap on total returned items (default 1000)                           |

**Returns** — `{ total_count, has_more, data: Price[] }`.

**Stripe docs** — https://stripe.com/docs/api/prices/list
