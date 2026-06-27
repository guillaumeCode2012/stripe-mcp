# Meters

Create, retrieve, and list Stripe billing meters. Meters aggregate usage
events (e.g. API calls, bytes transferred) that can be attached to prices for
metered billing. Customers record events under the meter's `event_name`, and
Stripe aggregates them according to the meter's `default_aggregation.formula`.

All tools validate input with zod and return the Stripe Billing.Meter object
as pretty-printed JSON on success or a human-readable error string on failure.
`stripe_meters_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_meters_create

Create a billing meter for usage-based pricing. Use when you want to bill
customers based on consumption (API calls, bytes, compute seconds, messages
sent). Meters aggregate usage events that can be attached to prices for
metered billing.

**Parameters**

| Param                  | Type   | Required | Description                                                                                                |
| ---------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `display_name`         | string | yes      | Human-readable name of the meter (e.g. `API Calls`). Not visible to customers.                             |
| `event_name`           | string | yes      | The meter event name in snake_case (e.g. `api_calls`). Meter events use this to record usage.             |
| `default_aggregation`  | object | yes      | `{ formula: 'sum' \| 'count' \| 'last' }` — how meter events are aggregated                               |
| `customer_mapping`     | object | no       | `{ event_payload_key: string, type: 'by_id' }` — how meter events map to a customer                       |
| `value_settings`       | object | no       | `{ event_payload_key: string }` — for `sum`/`last` formulas: which event payload key holds the numeric value |
| `event_time_window`    | string | no       | Pre-aggregation time window: `day` \| `hour`. Omit for no pre-aggregation.                                 |

**Returns** — the created Stripe Billing.Meter object.

**Stripe docs** — https://stripe.com/docs/api/billing/meter/create

---

### stripe_meters_get

Retrieve a billing meter by ID. Use to inspect a meter's display_name,
event_name, default_aggregation, status, and customer_mapping.

**Parameters**

| Param      | Type   | Required | Description                                  |
| ---------- | ------ | -------- | -------------------------------------------- |
| `meter_id` | string | yes      | The ID of the billing meter to retrieve (e.g. `meter_...`) |

**Returns** — the full Stripe Billing.Meter object including display_name,
event_name, default_aggregation, status, and customer_mapping.

**Stripe docs** — https://stripe.com/docs/api/billing/meter/retrieve

---

### stripe_meters_list

List billing meters. Auto-paginates up to `max_items`.

**Parameters**

| Param            | Type    | Required | Description                                                                |
| ---------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size (1–100)                                                          |
| `starting_after` | string  | no       | Cursor: ID of the last meter from the previous page                        |
| `max_items`      | integer | no       | Cap on total meters returned (default 100, max 1000)                       |

**Returns** — `{ total_count, has_more, data: Meter[] }`.

**Stripe docs** — https://stripe.com/docs/api/billing/meter/list
