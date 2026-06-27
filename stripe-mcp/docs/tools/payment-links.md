# Payment Links

Create, retrieve, update, and list Stripe Payment Links. A Payment Link is a
hosted Stripe checkout URL for one or more products — share it via email,
social, QR code, or anywhere a customer can click. Each visit creates a new
Checkout Session.

All tools validate input with zod and return the Stripe PaymentLink object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_payment_links_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_payment_links_create

Create a hosted Payment Link that customers can visit to purchase one or more
products. Use when you need a shareable URL for a product (email, social, QR),
want to sell without building a custom checkout, or are setting up a no-code
storefront.

**Parameters**

| Param                       | Type    | Required | Description                                                                |
| --------------------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `line_items`                | array   | yes      | Array of `{ price: string, quantity: integer }` items to sell (up to 20)  |
| `application_fee_amount`    | integer | no       | Connect only: fee in cents to transfer to the platform account             |
| `metadata`                  | object  | no       | Arbitrary key-value metadata copied to checkout sessions created by this link |
| `allow_promotion_codes`     | boolean | no       | If `true`, customers can redeem promotion codes at checkout                |
| `automatic_tax`             | object  | no       | `{ enabled: boolean }` — enable Stripe Tax automatic calculation          |
| `tax_id_collection`         | object  | no       | `{ enabled: boolean }` — collect customer tax IDs at checkout              |
| `billing_address_collection`| string  | no       | `auto` \| `required`. Defaults to `auto`.                                  |
| `customer_creation`         | string  | no       | `always` \| `if_required`. When checkout sessions create a Customer (payment mode only). |

**Returns** — the full Stripe PaymentLink object (id, url, line_items,
active).

**Stripe docs** — https://stripe.com/docs/api/payment_links/create

---

### stripe_payment_links_get

Retrieve a single payment link by its ID. Use when you need the live URL of an
existing payment link, want to inspect line items, tax settings, and active
state, or are verifying a link before sharing it with customers.

**Parameters**

| Param             | Type     | Required | Description                                                  |
| ----------------- | -------- | -------- | ------------------------------------------------------------ |
| `payment_link_id` | string   | yes      | The ID of the payment link to retrieve (e.g. `plink_1Nabc...`) |
| `expand`          | string[] | no       | Fields to expand (e.g. `["line_items"]`)                     |

**Returns** — the full Stripe PaymentLink object (id, url, line_items,
active, metadata).

**Stripe docs** — https://stripe.com/docs/api/payment_links/retrieve

---

### stripe_payment_links_update

Update an existing payment link's active state, line items, or metadata. Use
when you need to pause a link without deleting it (`active=false`), swap prices
or quantities on an existing link, or update metadata for tracking purposes.

**Parameters**

| Param             | Type    | Required | Description                                                                |
| ----------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `payment_link_id` | string  | yes      | The ID of the payment link to update (e.g. `plink_1Nabc...`)               |
| `active`          | boolean | no       | Set `false` to deactivate the link (visitors see an inactive page). Set `true` to reactivate. |
| `line_items`      | array   | no       | Replacement line items (up to 20). Replaces the existing set entirely.     |
| `metadata`        | object  | no       | Updated key-value metadata                                                 |

**Returns** — the updated Stripe PaymentLink object.

**Stripe docs** — https://stripe.com/docs/api/payment_links/update

---

### stripe_payment_links_list

List all payment links in the account, auto-paginating through every page. Use
when you need an inventory of all hosted checkout links, are auditing which
links are active vs. deactivated, or want to bulk-export links for reporting.

**Parameters**

| Param            | Type    | Required | Description                                                                                |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`          | integer | no       | Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when `max_items` is omitted. |
| `starting_after` | string  | no       | Cursor: an existing payment link ID to start pagination after                              |
| `max_items`      | integer | no       | Hard cap on the total number of payment links returned (defaults to 100,000 if omitted)    |

**Returns** — `{ total_count, has_more, data: PaymentLink[] }` with all links
up to `max_items`.

**Stripe docs** — https://stripe.com/docs/api/payment_links/list
