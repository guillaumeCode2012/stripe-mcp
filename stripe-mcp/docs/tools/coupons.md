# Coupons

Create, retrieve, delete, and list Stripe coupons. Coupons define discount
rules (a percentage off or a fixed amount off, for `once` / `repeating` /
`forever` duration) and are applied to invoices or subscriptions. Promotion
codes (see `docs/tools/promotion-codes.md`) wrap coupons into customer-facing
redeemable codes.

All tools validate input with zod and return the Stripe Coupon object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_coupons_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_coupons_create

Create a coupon that can be applied to subscriptions or invoices for a
discount. Use when you need a percentage discount (e.g. 20% off) on a
subscription or invoice, or a fixed-amount discount (e.g. $5 off) in a
specific currency.

**Parameters**

| Param                | Type    | Required | Description                                                                                          |
| -------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `percent_off`        | number  | no*      | Positive float (0–100) representing the discount percent. *Required if `amount_off` is not given.*  |
| `amount_off`         | integer | no*      | Positive integer (cents) to subtract from an invoice total. *Required if `percent_off` is not given.* |
| `currency`           | string  | no       | Three-letter ISO currency code (lowercase). Required when `amount_off` is set.                       |
| `duration`           | string  | yes      | `once` \| `repeating` \| `forever` — how long the discount lasts                                     |
| `duration_in_months` | integer | no       | Number of months the discount is in effect. Required when `duration="repeating"`.                    |
| `max_redemptions`    | integer | no       | Maximum number of times this coupon can be redeemed                                                  |
| `redeem_by`          | integer | no       | Unix timestamp (seconds) of the last time the coupon can be redeemed                                 |
| `name`               | string  | no       | Display name shown to customers on invoices and receipts                                             |
| `metadata`           | object  | no       | Arbitrary key-value metadata attached to the coupon                                                  |
| `applies_to`         | object  | no       | `{ products: string[] }` — restrict the coupon to specific products                                  |

**Returns** — the full Stripe Coupon object (id, `percent_off`/`amount_off`,
duration, validity, metadata).

**Stripe docs** — https://stripe.com/docs/api/coupons/create

---

### stripe_coupons_get

Retrieve a single coupon by its ID. Use when you need to inspect a coupon's
discount rules, validity, and redemption counts, or to verify a coupon exists
before applying it to a customer.

**Parameters**

| Param       | Type   | Required | Description                                                  |
| ----------- | ------ | -------- | ------------------------------------------------------------ |
| `coupon_id` | string | yes      | The ID of the coupon to retrieve (e.g. `25OFF` or `coupon_1Nabc...`) |

**Returns** — the full Stripe Coupon object (id, `percent_off`/`amount_off`,
duration, `times_redeemed`, etc.).

**Stripe docs** — https://stripe.com/docs/api/coupons/retrieve

---

### stripe_coupons_delete

Permanently delete a coupon. Existing customers on the coupon keep their
discount. Use when a promotion has ended and you want to prevent new
redemptions, or when cleaning up test coupons.

**Parameters**

| Param       | Type   | Required | Description                                                  |
| ----------- | ------ | -------- | ------------------------------------------------------------ |
| `coupon_id` | string | yes      | The ID of the coupon to delete (e.g. `25OFF` or `coupon_1Nabc...`) |

**Returns** — a Stripe deletion confirmation object
`{ id, object: "coupon", deleted: true }`.

**Stripe docs** — https://stripe.com/docs/api/coupons/delete

---

### stripe_coupons_list

List all coupons in the account, auto-paginating through every page. Use when
you need an inventory of available discounts, are auditing which coupons are
still redeemable, or want to bulk-export coupons for reporting.

**Parameters**

| Param            | Type    | Required | Description                                                                                |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`          | integer | no       | Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when `max_items` is omitted. |
| `starting_after` | string  | no       | Cursor: an existing coupon ID to start pagination after                                    |
| `max_items`      | integer | no       | Hard cap on the total number of coupons returned (defaults to 100,000 if omitted)          |

**Returns** — `{ total_count, has_more, data: Coupon[] }` with all coupons up
to `max_items`.

**Stripe docs** — https://stripe.com/docs/api/coupons/list
