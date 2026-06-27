# Refunds

Create, retrieve, and list Stripe refunds. Refunds return previously captured
funds to a customer. Partial refunds are supported via the `amount` parameter.

All tools validate input with zod and return the Stripe Refund object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_refunds_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_refunds_create

Create a refund for a previously captured charge or PaymentIntent. Use when a
customer requests a refund or a payment was made in error. If `amount` is
omitted, Stripe issues a full refund.

**Parameters**

| Param                    | Type    | Required | Description                                                                            |
| ------------------------ | ------- | -------- | -------------------------------------------------------------------------------------- |
| `payment_intent`         | string  | no*      | ID of the PaymentIntent to refund (`pi_1abc23`). *One of `payment_intent` or `charge` is required.* |
| `charge`                 | string  | no*      | ID of the charge to refund (`ch_1abc23`)                                               |
| `amount`                 | integer | no       | Amount to refund in smallest currency unit. Defaults to full refund.                   |
| `reason`                 | string  | no       | `duplicate` \| `fraudulent` \| `requested_by_customer` \| `expired_uncaptured_charge`  |
| `metadata`               | object  | no       | Set of key-value pairs to attach to the object                                         |
| `refund_application_fee` | boolean | no       | Refund the application fee on a Connect charge                                         |
| `reverse_transfer`       | boolean | no       | Reverse the transfer on a Connect charge                                               |

**Returns** — the created Stripe Refund object.

**Stripe docs** — https://stripe.com/docs/api/refunds/create

---

### stripe_refunds_get

Retrieve a single refund by ID. Use when you want to check the status of a
refund or inspect the metadata or amount on a refund.

**Parameters**

| Param       | Type   | Required | Description                                     |
| ----------- | ------ | -------- | ----------------------------------------------- |
| `refund_id` | string | yes      | ID of the refund to retrieve (e.g. `re_1abc23`) |

**Returns** — the Stripe Refund object.

**Stripe docs** — https://stripe.com/docs/api/refunds/retrieve

---

### stripe_refunds_list

List refunds, with optional filtering and auto-pagination. Use when you want
to review recent refunds or find refunds for a specific charge or
PaymentIntent.

**Parameters**

| Param             | Type    | Required | Description                                                       |
| ----------------- | ------- | -------- | ----------------------------------------------------------------- |
| `limit`           | integer | no       | Page size per request (max 100, default 100)                      |
| `payment_intent`  | string  | no       | Only return refunds for this PaymentIntent ID                     |
| `charge`          | string  | no       | Only return refunds for this charge ID                            |
| `starting_after`  | string  | no       | Cursor: ID of the object to start after                           |
| `max_items`       | integer | no       | Hard cap on total items to fetch across all pages                 |

**Returns** — `{ total_count, has_more, data: Refund[] }`.

**Stripe docs** — https://stripe.com/docs/api/refunds/list
