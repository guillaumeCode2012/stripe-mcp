# Promotion Codes

Create, retrieve, and list Stripe promotion codes. Promotion codes are the
customer-facing, redeemable wrappers around coupons — they're what a customer
types into a checkout "promo code" field. Create a coupon first, then create
one or more promotion codes that reference it.

All tools validate input with zod and return the Stripe PromotionCode object
as pretty-printed JSON on success or a human-readable error string on failure.
`stripe_promotion_codes_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_promotion_codes_create

Create a customer-redeemable promotion code backed by an existing coupon. Use
when you have a coupon and want a shareable, customer-facing code (e.g.
`WELCOME20`), want to restrict redemption to a single customer or a minimum
order amount, or are launching a marketing campaign with limited-use codes.

**Parameters**

| Param             | Type    | Required | Description                                                                                  |
| ----------------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `coupon`          | string  | yes      | The ID of the Coupon (e.g. `25OFF`) this promotion code will redeem                          |
| `code`            | string  | no       | Customer-facing code (a–z, A–Z, 0–9, dashes). If omitted, Stripe generates one.              |
| `customer`        | string  | no       | Customer ID restricted to redeem this code. If omitted, any customer can redeem.             |
| `max_redemptions` | integer | no       | Maximum total redemptions allowed for this code                                              |
| `expires_at`      | integer | no       | Unix timestamp (seconds) at which this promotion code expires                                |
| `active`          | boolean | no       | Whether the promotion code is currently active. Defaults to `true`.                          |
| `metadata`        | object  | no       | Arbitrary key-value metadata attached to the promotion code                                  |
| `restrictions`    | object  | no       | `{ minimum_amount?: integer, minimum_amount_currency?: string, first_time_transaction?: boolean }` |

**Returns** — the full Stripe PromotionCode object (id, code, coupon, active,
restrictions, `times_redeemed`).

**Stripe docs** — https://stripe.com/docs/api/promotion_codes/create

---

### stripe_promotion_codes_get

Retrieve a single promotion code by its ID. Use when you need to check the
active state, redemption count, or restrictions of a code, or want to verify
a customer-facing code before launching a campaign.

**Parameters**

| Param                | Type     | Required | Description                                                  |
| -------------------- | -------- | -------- | ------------------------------------------------------------ |
| `promotion_code_id`  | string   | yes      | The ID of the promotion code to retrieve (e.g. `promo_1Nabc...`) |
| `expand`             | string[] | no       | Fields to expand (e.g. `["coupon", "customer"]`)             |

**Returns** — the full Stripe PromotionCode object (id, code, coupon, active,
`times_redeemed`, restrictions).

**Stripe docs** — https://stripe.com/docs/api/promotion_codes/retrieve

---

### stripe_promotion_codes_list

List promotion codes, auto-paginating through every page. Use when you need to
audit all redeemable codes for a campaign, filter codes by coupon or active
state, or report on redemption counts across codes.

**Parameters**

| Param            | Type    | Required | Description                                                                                |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`          | integer | no       | Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when `max_items` is omitted. |
| `coupon`         | string  | no       | Only return promotion codes for this coupon ID                                             |
| `active`         | boolean | no       | Filter by active state. `true` returns active codes, `false` returns inactive.             |
| `starting_after` | string  | no       | Cursor: an existing promotion code ID to start pagination after                            |
| `max_items`      | integer | no       | Hard cap on the total number of promotion codes returned (defaults to 100,000 if omitted)  |

**Returns** — `{ total_count, has_more, data: PromotionCode[] }` with all
matching codes up to `max_items`.

**Stripe docs** — https://stripe.com/docs/api/promotion_codes/list
