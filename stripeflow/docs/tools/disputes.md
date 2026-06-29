# Disputes

Retrieve, update, close, and list Stripe disputes. A dispute (chargeback) is
raised by a customer's bank when they contest a charge. You can respond with
evidence, or accept (close) the dispute.

All tools validate input with zod and return the Stripe Dispute object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_disputes_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_disputes_get

Retrieve a single dispute by ID. Use when you need to inspect the evidence on
a chargeback or check the status or amount of a dispute.

**Parameters**

| Param        | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `dispute_id` | string | yes      | ID of the dispute to retrieve (e.g. `dp_1abc23`)  |

**Returns** — the Stripe Dispute object.

**Stripe docs** — https://stripe.com/docs/api/disputes/retrieve

---

### stripe_disputes_update

Update a dispute with evidence or metadata, optionally submitting it. Use when
you are responding to a chargeback with evidence or attaching metadata to
track dispute status internally.

**Parameters**

| Param        | Type    | Required | Description                                                                                  |
| ------------ | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `dispute_id` | string  | yes      | ID of the dispute to update (e.g. `dp_1abc23`)                                               |
| `evidence`   | object  | no       | Key-value map of evidence fields (e.g. `access_activity_log`, `billing_address`). See Stripe dispute evidence docs. |
| `submit`     | boolean | no       | Whether to submit evidence immediately (closes the dispute)                                 |
| `metadata`   | object  | no       | Set of key-value pairs to attach to the object                                              |

**Returns** — the updated Stripe Dispute object.

**Stripe docs** — https://stripe.com/docs/api/disputes/update ·
Dispute evidence: https://stripe.com/docs/disputes/responding

---

### stripe_disputes_close

Close a dispute, forfeiting the dispute to the customer. Use when you decide
**not** to challenge a dispute or want to accept the chargeback immediately.

**Parameters**

| Param        | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `dispute_id` | string | yes      | ID of the dispute to close (e.g. `dp_1abc23`)     |

**Returns** — the closed Stripe Dispute object (`status: 'lost'`).

**Stripe docs** — https://stripe.com/docs/api/disputes/close

---

### stripe_disputes_list

List disputes, with optional filtering and auto-pagination. Use when you want
to review recent chargebacks or find disputes for a specific charge or
PaymentIntent.

**Parameters**

| Param             | Type    | Required | Description                                                       |
| ----------------- | ------- | -------- | ----------------------------------------------------------------- |
| `limit`           | integer | no       | Page size per request (max 100, default 100)                      |
| `payment_intent`  | string  | no       | Only return disputes for this PaymentIntent ID                    |
| `charge`          | string  | no       | Only return disputes for this charge ID                           |
| `starting_after`  | string  | no       | Cursor: ID of the object to start after                           |
| `max_items`       | integer | no       | Hard cap on total items to fetch across all pages                 |

**Returns** — `{ total_count, has_more, data: Dispute[] }`.

**Stripe docs** — https://stripe.com/docs/api/disputes/list
