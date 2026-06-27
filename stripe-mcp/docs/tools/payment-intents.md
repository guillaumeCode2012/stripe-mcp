# Payment Intents

Create, retrieve, confirm, cancel, and list Stripe PaymentIntents. A
PaymentIntent tracks the lifecycle of a one-time payment — from creation
through confirmation and capture. Subscriptions and invoices use them under
the hood.

All tools validate input with zod and return the Stripe PaymentIntent object
as pretty-printed JSON on success or a human-readable error string on failure.
`stripe_payment_intents_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_payment_intents_create

Create a PaymentIntent to collect payment from a customer. Use when you need
to charge a customer a one-time amount or you're building a custom checkout
flow.

**Parameters**

| Param                       | Type    | Required | Description                                                                |
| --------------------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `amount`                    | integer | yes      | Amount in the smallest currency unit (e.g. cents for USD)                  |
| `currency`                  | string  | yes      | Three-letter ISO currency code, lowercase (e.g. `usd`)                     |
| `customer`                  | string  | no       | ID of the customer to attach this PaymentIntent to                         |
| `description`               | string  | no       | Arbitrary description for the PaymentIntent                                |
| `metadata`                  | object  | no       | Set of key-value pairs to attach to the object                             |
| `payment_method`            | string  | no       | ID of the payment method to use with this PaymentIntent                    |
| `confirm`                   | boolean | no       | If `true`, attempt to confirm the PaymentIntent immediately                |
| `automatic_payment_methods` | object  | no       | `{ enabled: boolean }` — enable automatic payment methods                  |
| `receipt_email`             | string  | no       | Email to send the receipt to                                               |
| `statement_descriptor`      | string  | no       | Information about the charge for the customer's bank statement             |

**Returns** — the created Stripe PaymentIntent object (includes `client_secret`).

**Stripe docs** — https://stripe.com/docs/api/payment_intents/create

---

### stripe_payment_intents_get

Retrieve a single PaymentIntent by ID. Use when you need to check the status
of a payment or inspect the charges, amount, or metadata on a PaymentIntent.

**Parameters**

| Param               | Type   | Required | Description                                            |
| ------------------- | ------ | -------- | ------------------------------------------------------ |
| `payment_intent_id` | string | yes      | ID of the PaymentIntent to retrieve (e.g. `pi_1abc23`) |

**Returns** — the Stripe PaymentIntent object.

**Stripe docs** — https://stripe.com/docs/api/payment_intents/retrieve

---

### stripe_payment_intents_confirm

Confirm a PaymentIntent, kickstarting payment processing. Use when you
previously created a PaymentIntent and now want to collect payment, or when a
PaymentIntent requires additional confirmation (e.g. after a SCA challenge).

**Parameters**

| Param               | Type   | Required | Description                                                                  |
| ------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| `payment_intent_id` | string | yes      | ID of the PaymentIntent to confirm (e.g. `pi_1abc23`)                        |
| `payment_method`    | string | no       | ID of the payment method to use for confirmation                             |
| `receipt_email`     | string | no       | Email to send the receipt to                                                 |
| `return_url`        | string | no       | URL to redirect the customer back to after authentication                    |
| `mandate`           | string | no       | ID of the mandate to use for this confirmation                               |

**Returns** — the confirmed (or still-pending) Stripe PaymentIntent object.

**Stripe docs** — https://stripe.com/docs/api/payment_intents/confirm

---

### stripe_payment_intents_cancel

Cancel a PaymentIntent that has not yet been captured. Use when a customer
abandons checkout, a payment is suspected to be fraudulent, or the
PaymentIntent was created in error.

**Parameters**

| Param                | Type   | Required | Description                                                                                  |
| -------------------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `payment_intent_id`  | string | yes      | ID of the PaymentIntent to cancel (e.g. `pi_1abc23`)                                         |
| `cancellation_reason`| string | no       | `duplicate` \| `fraudulent` \| `requested_by_customer` \| `abandoned`                        |

**Returns** — the canceled Stripe PaymentIntent object.

**Stripe docs** — https://stripe.com/docs/api/payment_intents/cancel

---

### stripe_payment_intents_list

List PaymentIntents, with optional filtering and auto-pagination. Use when you
want to review recent payments or find PaymentIntents for a specific customer
or status.

**Parameters**

| Param            | Type    | Required | Description                                                                              |
| ---------------- | ------- | -------- | ---------------------------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size per request (max 100, default 100)                                             |
| `customer`       | string  | no       | Only return PaymentIntents for this customer ID                                          |
| `status`         | string  | no       | `requires_payment_method` \| `requires_confirmation` \| `succeeded` \| `canceled` \| `processing` \| `requires_action` |
| `starting_after` | string  | no       | Cursor: ID of the object to start after                                                  |
| `max_items`      | integer | no       | Hard cap on total items to fetch across all pages                                        |

**Returns** — `{ total_count, has_more, data: PaymentIntent[] }`.

**Stripe docs** — https://stripe.com/docs/api/payment_intents/list
