# Payouts

Create, retrieve, cancel, and list Stripe payouts. Payouts move funds from
your Stripe available balance to your bank account or debit card. Stripe can
create them automatically on a schedule, or you can create them manually.

All tools validate input with zod and return the Stripe Payout object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_payouts_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_payouts_create

Create an outgoing payout to a bank account or debit card. Use to manually
withdraw funds from your Stripe available balance.

**Parameters**

| Param                 | Type    | Required | Description                                                                                                |
| --------------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `amount`              | integer | yes      | Positive integer in cents (or local equivalent) representing how much to payout                            |
| `currency`            | string  | yes      | Three-letter ISO currency code, lowercase (e.g. `usd`, `eur`)                                              |
| `destination`         | string  | no       | ID of a bank account or card to send the payout to. If omitted, Stripe uses the default external account.  |
| `method`              | string  | no       | `standard` (1–2 business days) \| `instant` (minutes, supported in certain countries)                      |
| `statement_descriptor`| string  | no       | String that displays on the recipient bank/card statement (up to 22 characters)                            |
| `metadata`            | object  | no       | Set of key-value pairs attached to the payout for your internal use                                        |

**Returns** — the created Stripe Payout object.

**Stripe docs** — https://stripe.com/docs/api/payouts/create

---

### stripe_payouts_get

Retrieve the details of an existing payout by ID. Use when you need to
inspect a payout's status, amount, currency, arrival date, or destination.

**Parameters**

| Param       | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `payout_id` | string | yes      | The ID of the payout to retrieve (e.g. `po_...`) |

**Returns** — the full Stripe Payout object including status, amount,
currency, arrival date, and destination.

**Stripe docs** — https://stripe.com/docs/api/payouts/retrieve

---

### stripe_payouts_cancel

Cancel a previously created payout. Only payouts in `pending` status can be
canceled; Stripe refunds the funds to your available balance. **Automatic
Stripe payouts cannot be canceled.**

**Parameters**

| Param       | Type   | Required | Description                                          |
| ----------- | ------ | -------- | ---------------------------------------------------- |
| `payout_id` | string | yes      | The payout ID to cancel (e.g. `po_...`). Must be `pending`. |

**Returns** — the canceled Stripe Payout object (`status: 'canceled'`).

**Stripe docs** — https://stripe.com/docs/api/payouts/cancel

---

### stripe_payouts_list

List payouts with optional filters (status, destination, arrival_date).
Auto-paginates up to `max_items`.

**Parameters**

| Param            | Type    | Required | Description                                                                |
| ---------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size (1–100). Ignored if `max_items` is used.                         |
| `status`         | string  | no       | Filter by status: `paid` \| `pending` \| `in_transit` \| `canceled` \| `failed` |
| `arrival_date`   | integer | no       | Unix timestamp (seconds) — only return payouts expected to arrive on this date |
| `destination`    | string  | no       | External account ID — only return payouts sent to this account             |
| `starting_after` | string  | no       | Cursor: ID of the last payout from the previous page                       |
| `max_items`      | integer | no       | Cap on total payouts returned (auto-paginates up to this count, default 100, max 1000) |

**Returns** — `{ total_count, has_more, data: Payout[] }`.

**Stripe docs** — https://stripe.com/docs/api/payouts/list
