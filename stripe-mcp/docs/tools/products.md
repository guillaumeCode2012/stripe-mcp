# Products

Create, retrieve, update, archive, and list Stripe products. Products are the
sellable items in your catalogue; prices (one-time or recurring) attach to
products and are what customers actually pay for.

All tools validate input with zod and return the Stripe Product object as
pretty-printed JSON on success or a human-readable error string on failure.
List tools auto-paginate and wrap results as `{ total_count, has_more, data }`.

---

### stripe_products_create

Create a new product in Stripe. Use when you need a Product to attach Prices
to (subscriptions, one-time purchases) or when adding a new plan/SKU to your
catalogue.

**Parameters**

| Param           | Type     | Required | Description                                                       |
| --------------- | -------- | -------- | ----------------------------------------------------------------- |
| `name`          | string   | yes      | Product name (displayable to the customer)                        |
| `description`   | string   | no       | Long-form description of the product                              |
| `images`        | string[] | no       | Up to 8 image URLs for this product                               |
| `default_price` | string   | no       | ID of an existing Price to set as this product's default price    |
| `metadata`      | object   | no       | Arbitrary key-value pairs (keys and values are strings)           |
| `active`        | boolean  | no       | Whether the product is available for purchase. Defaults to `true`.|

**Returns** — the created Stripe Product object.

**Stripe docs** — https://stripe.com/docs/api/products/create

---

### stripe_products_get

Retrieve a single Stripe product by ID. Use when you need the full product
object or want to expand the related `default_price` object.

**Parameters**

| Param        | Type     | Required | Description                                              |
| ------------ | -------- | -------- | -------------------------------------------------------- |
| `product_id` | string   | yes      | Stripe product ID (e.g. `prod_1a2b3c`)                   |
| `expand`     | string[] | no       | Fields to expand. Commonly useful: `default_price`.      |

**Returns** — the Stripe Product object.

**Stripe docs** — https://stripe.com/docs/api/products/retrieve

---

### stripe_products_update

Update an existing Stripe product. Use to rename a product, change its
description, swap images, change the default price, or (de)activate a product
without fully archiving it (use `stripe_products_archive` for the standard
archive flow).

**Parameters**

| Param           | Type     | Required | Description                                                       |
| --------------- | -------- | -------- | ----------------------------------------------------------------- |
| `product_id`    | string   | yes      | Stripe product ID to update (e.g. `prod_1a2b3c`)                  |
| `name`          | string   | no       | New product name                                                  |
| `description`   | string   | no       | New product description                                           |
| `images`        | string[] | no       | New list of up to 8 image URLs (replaces the existing list)       |
| `metadata`      | object   | no       | Arbitrary key-value pairs (empty string unsets a key)             |
| `active`        | boolean  | no       | Whether the product is available for purchase                     |
| `default_price` | string   | no       | ID of a Price to set as this product's new default price          |

**Returns** — the updated Stripe Product object.

**Stripe docs** — https://stripe.com/docs/api/products/update

---

### stripe_products_archive

Archive a Stripe product by marking it inactive (`active: false`). Archiving —
not deleting — is the Stripe-recommended way to retire a product because
existing subscriptions and invoices still reference it. The product can be
reactivated later by updating `active` back to `true`.

**Parameters**

| Param        | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `product_id` | string | yes      | Stripe product ID to archive (e.g. `prod_1a2b3c`) |

**Returns** — the updated Stripe Product object with `active: false`.

**Stripe docs** — https://stripe.com/docs/api/products/update

---

### stripe_products_list

List Stripe products with auto-pagination. Use when you need to enumerate all
or many products (catalogue, sync) or filter by active/inactive status or by a
set of IDs.

**Parameters**

| Param            | Type     | Required | Description                                                          |
| ---------------- | -------- | -------- | -------------------------------------------------------------------- |
| `limit`          | integer  | no       | Page size (1-100). Results are auto-paginated up to `max_items`.     |
| `active`         | boolean  | no       | Filter: only return active (`true`) or inactive (`false`) products   |
| `ids`            | string[] | no       | Only return products with these IDs (cannot be used with `starting_after`) |
| `starting_after` | string   | no       | Cursor: a product ID to start after (manual pagination)              |
| `max_items`      | integer  | no       | Cap on total returned items (default 1000)                           |

**Returns** — `{ total_count, has_more, data: Product[] }`.

**Stripe docs** — https://stripe.com/docs/api/products/list
