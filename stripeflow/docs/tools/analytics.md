# Analytics

Compute MRR, churn, revenue summaries, top customers, and failed-payment
reports by paginating Stripe resources client-side and aggregating locally.
Stripe has no native MRR or churn endpoint, so these tools implement the
canonical Baremetrics/ChartMogul methodology themselves. **No other Stripe
MCP server ships analytics tools — these are the crown jewel of StripeFlow.**

All analytics tools compute client-side (no Stripe-side aggregation
available) and may be slow on accounts with > 50,000 charges or
subscriptions. Caps bound the work. All tools validate input with zod and
return a structured JSON summary on success or a human-readable error string
on failure.

---

### stripe_analytics_get_mrr

Compute Monthly Recurring Revenue (MRR) by aggregating all active
subscriptions client-side. Returns total MRR, breakdowns by plan and
currency, top 10 customers by MRR, and active subscription count. Trial
subscriptions are excluded by default.

**Parameters**

| Param             | Type    | Required | Description                                                                                       |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| `currency`        | string  | no       | Primary currency (3-letter lowercase ISO code) used for totals and top customers. Defaults to `usd`. Subscriptions in other currencies are still broken out in `mrr_by_currency`. |
| `include_trials`  | boolean | no       | If `true`, include subscriptions currently in trial. Defaults to `false`.                         |

**Returns** —

```json
{
  "total_mrr": 5280.00,
  "total_mrr_formatted": "$5280.00",
  "mrr_by_plan": {
    "Pro":     { "mrr": 3000.00, "customer_count": 150 },
    "Annual":  { "mrr": 2280.00, "customer_count": 190 }
  },
  "mrr_by_currency": { "usd": 5280.00, "eur": 1190.00 },
  "top_customers_by_mrr": [
    { "customer_id": "cus_1", "email": "acme@example.com", "name": "Acme", "mrr": 499, "mrr_formatted": "$499.00" }
  ],
  "active_subscription_count": 340,
  "currency": "usd",
  "computed_at": "2025-01-15T10:30:00.000Z"
}
```

**Stripe docs** — https://stripe.com/docs/api/subscriptions/list (raw data source)

---

### stripe_analytics_get_churn_rate

Compute subscription churn rate for a given period. Fetches all subscriptions
created before `period_end`, identifies those canceled within
`[period_start, period_end]`, and estimates the active subscription count at
`period_start`.

**Parameters**

| Param           | Type   | Required | Description                                                              |
| --------------- | ------ | -------- | ------------------------------------------------------------------------ |
| `period_start`  | string | no       | ISO 8601 start of the analysis window. Defaults to 30 days ago.          |
| `period_end`    | string | no       | ISO 8601 end of the analysis window. Defaults to now.                    |
| `interval`      | string | no       | Reporting interval label: `monthly` \| `weekly`. Defaults to `monthly`. Does not change data fetched, only the interval tag. |

**Returns** —

```json
{
  "churn_rate_percent": 4.21,
  "churned_count": 13,
  "active_at_period_start": 309,
  "period_start": 1734220800,
  "period_end": 1736812800,
  "period_start_iso": "2024-12-15T00:00:00.000Z",
  "period_end_iso": "2025-01-14T00:00:00.000Z",
  "interval": "monthly",
  "churned_customers": [
    {
      "subscription_id": "sub_1",
      "customer_id": "cus_1",
      "email": "jane@example.com",
      "canceled_at": 1736810000,
      "canceled_at_iso": "2025-01-13T23:13:20.000Z",
      "lifetime_value_estimate": 240.00,
      "cancellation_reason": "too_expensive"
    }
  ]
}
```

**Stripe docs** — https://stripe.com/docs/api/subscriptions/list (raw data source)

---

### stripe_analytics_get_revenue_summary

Aggregate gross/net revenue, refunds, payment counts, failure rate, and a time
series for a given period. Computes client-side from charges.

**Parameters**

| Param    | Type   | Required | Description                                                                                                |
| -------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `period` | string | yes      | Predefined time window: `last_7_days` \| `last_30_days` \| `last_90_days` \| `last_12_months` \| `month_to_date` \| `year_to_date` |

**Returns** —

```json
{
  "period": "last_30_days",
  "period_start": 1734220800,
  "period_end": 1736812800,
  "period_start_iso": "2024-12-15T00:00:00.000Z",
  "period_end_iso": "2025-01-14T00:00:00.000Z",
  "currency": "usd",
  "gross_revenue": 245000,
  "gross_revenue_formatted": "$2450.00",
  "net_revenue": 238000,
  "net_revenue_formatted": "$2380.00",
  "refund_amount": 7000,
  "refund_amount_formatted": "$70.00",
  "refund_rate_percent": 2.86,
  "successful_payments": 198,
  "failed_payments": 12,
  "failure_rate_percent": 5.71,
  "avg_transaction_value": 1237,
  "avg_transaction_value_formatted": "$12.37",
  "time_series": [
    { "date": "2024-12-15", "gross": 7000, "net": 6800, "count": 6 },
    { "date": "2024-12-16", "gross": 9500, "net": 9500, "count": 8 }
  ]
}
```

**Stripe docs** — https://stripe.com/docs/api/charges/list (raw data source)

---

### stripe_analytics_get_top_customers

Rank customers by `lifetime_value`, `mrr`, or `payment_count`. For
`lifetime_value` / `payment_count`, fetches all succeeded charges in the
lookback window (or all time if `period_days` is omitted) and groups by
customer. For `mrr`, computes per-customer MRR from active subscriptions.

**Parameters**

| Param         | Type    | Required | Description                                                                                          |
| ------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `limit`       | integer | no       | Number of top customers to return (default 10, max 50)                                               |
| `metric`      | string  | no       | Ranking metric: `lifetime_value` (default) \| `mrr` \| `payment_count`                               |
| `period_days` | integer | no       | If provided, only count charges within the last N days for `lifetime_value` / `payment_count`. Ignored for `mrr`. (1–3650) |

**Returns** —

```json
{
  "metric": "lifetime_value",
  "metric_label": "Lifetime Value",
  "period_days": null,
  "computed_at_iso": "2025-01-15T10:30:00.000Z",
  "ranked": [
    {
      "rank": 1,
      "customer_id": "cus_acme",
      "email": "billing@acme.com",
      "name": "Acme Inc.",
      "value": 1250000,
      "value_formatted": "$12500.00",
      "metric_label": "Lifetime Value"
    }
  ]
}
```

**Stripe docs** — raw data sources:
- charges: https://stripe.com/docs/api/charges/list
- subscriptions: https://stripe.com/docs/api/subscriptions/list

---

### stripe_analytics_get_failed_payments_report

Report on failed charges over the last N days. Returns total failed amount,
count, a breakdown by decline code, and per-customer failure summaries with
recovery suggestions.

**Parameters**

| Param         | Type    | Required | Description                                            |
| ------------- | ------- | -------- | ------------------------------------------------------ |
| `period_days` | integer | no       | Lookback window in days (default 30, max 365)          |

**Returns** —

```json
{
  "period_days": 30,
  "period_start": 1734220800,
  "period_end": 1736812800,
  "period_start_iso": "2024-12-15T00:00:00.000Z",
  "currency": "usd",
  "total_failed_amount": 48500,
  "total_failed_amount_formatted": "$485.00",
  "count": 12,
  "failure_reasons_breakdown": {
    "insufficient_funds": { "count": 5, "amount": 21000 },
    "expired_card":       { "count": 4, "amount": 16000 },
    "generic_decline":    { "count": 3, "amount": 11500 }
  },
  "affected_customers": [
    {
      "customer_id": "cus_1",
      "email": "jane@example.com",
      "failed_count": 3,
      "failed_amount": 11500,
      "failed_amount_formatted": "$115.00",
      "last_failure_decline_code": "generic_decline",
      "last_failure_at": 1736809200,
      "last_failure_at_iso": "2025-01-13T22:20:00.000Z",
      "recovery_suggestion": "Ask customer to contact their bank or use a different card."
    }
  ]
}
```

**Recovery suggestions** are mapped per decline code:

| Decline code                 | Suggestion                                                  |
| ---------------------------- | ----------------------------------------------------------- |
| `insufficient_funds`         | Ask customer to use a different card or top up.             |
| `expired_card`               | Ask customer for a new card.                                |
| `lost_card` / `stolen_card`  | Do not retry; ask customer for a new card.                  |
| `generic_decline`            | Ask customer to contact their bank or use a different card. |
| (any other)                  | Retry after the customer updates their payment method.      |

**Stripe docs** — raw data source: https://stripe.com/docs/api/charges/list ·
Decline codes: https://stripe.com/docs/declines/codes
