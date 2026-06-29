# Balance

Retrieve your Stripe account balance and list the transactions that have
contributed to it. The Stripe balance tracks available and pending funds
across all currencies — every charge, refund, payout, and fee flows through it
as a BalanceTransaction.

All tools validate input with zod and return the Stripe Balance or
BalanceTransaction object as pretty-printed JSON on success or a
human-readable error string on failure. `stripe_balance_list_transactions`
auto-paginates and wraps results as `{ total_count, has_more, data }`.

---

### stripe_balance_get

Retrieve the current Stripe account balance across all currencies. Use when
you need to show available vs. pending funds in a dashboard, are reconciling
your Stripe balance against your bank payouts, or want a quick health check
that the Stripe API key is configured.

**Parameters** — none.

**Returns** — the Stripe Balance object (available, pending,
`instant_available`, `livemode`).

**Stripe docs** — https://stripe.com/docs/api/balance/balance_retrieve

---

### stripe_balance_list_transactions

List transactions that have contributed to the Stripe account balance,
auto-paginating through every page. Use when you need a full ledger of
charges, refunds, payouts, and fees, are reconciling Stripe activity against
your accounting system, or want to filter balance activity by type or by
payout.

**Parameters**

| Param            | Type    | Required | Description                                                                                |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `limit`          | integer | no       | Suggested page size hint (Stripe caps at 100). Acts as a max-items cap when `max_items` is omitted. |
| `payout`         | string  | no       | Only return transactions paid out on this Payout ID (automatic payouts only)               |
| `type`           | string  | no       | Filter by transaction type: `charge`, `refund`, `payout`, `transfer`, `payment`, `payment_failure_refund`, `payment_refund`, `payment_reversal`, `adjustment`, `application_fee`, `application_fee_refund`, `stripe_fee`, `stripe_fx_fee`, `topup`, `topup_reversal`, `payout_cancel`, `payout_failure`, `transfer_cancel`, `transfer_refund`, `reserve_transaction` |
| `starting_after` | string  | no       | Cursor: an existing balance transaction ID to start pagination after                       |
| `max_items`      | integer | no       | Hard cap on the total number of transactions returned (defaults to 100,000 if omitted)     |

**Returns** — `{ total_count, has_more, data: BalanceTransaction[] }` with all
matching transactions up to `max_items`.

**Stripe docs** — https://stripe.com/docs/api/balance_transactions/list ·
Transaction types: https://stripe.com/docs/reports/balance-transaction-types
