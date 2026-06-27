# Webhooks

Create, retrieve, update, delete, and list Stripe webhook endpoints. Webhook
endpoints are HTTPS URLs Stripe posts signed events to — they're the canonical
way to react to Stripe activity (charges, invoices, subscriptions) in near
real time.

All tools validate input with zod and return the Stripe WebhookEndpoint object
as pretty-printed JSON on success or a human-readable error string on failure.
`stripe_webhooks_list` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_webhooks_create

Create a webhook endpoint to receive Stripe event notifications. Use when you
want to be notified of events like `charge.succeeded` or `invoice.paid`, or
when configuring a new backend service to react to Stripe events.

**Parameters**

| Param             | Type     | Required | Description                                                                          |
| ----------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `url`             | string   | yes      | HTTPS URL of the webhook endpoint to receive events                                 |
| `enabled_events`  | string[] | yes      | List of event types to subscribe to (e.g. `["charge.succeeded", "invoice.paid"]`)   |
| `description`     | string   | no       | Optional description for the webhook endpoint                                       |
| `metadata`        | object   | no       | Set of key-value pairs to attach to the object                                      |
| `api_version`     | string   | no       | Stripe API version the endpoint should use (e.g. `2024-12-18.acacia`)               |

**Returns** — the created Stripe WebhookEndpoint object (includes a signing
secret).

**Stripe docs** — https://stripe.com/docs/api/webhook_endpoints/create

---

### stripe_webhooks_get

Retrieve a single webhook endpoint by ID. Use when you want to inspect a
webhook endpoint configuration or verify which events a webhook is subscribed
to.

**Parameters**

| Param        | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `webhook_id` | string | yes      | ID of the webhook endpoint to retrieve (e.g. `we_1abc23`) |

**Returns** — the Stripe WebhookEndpoint object.

**Stripe docs** — https://stripe.com/docs/api/webhook_endpoints/retrieve

---

### stripe_webhooks_update

Update a webhook endpoint (URL, events, description, enabled state, metadata).
Use when your webhook receiver URL has changed, you want to add or remove
subscribed events, or you need to temporarily disable an endpoint.

**Parameters**

| Param             | Type     | Required | Description                                                                  |
| ----------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `webhook_id`      | string   | yes      | ID of the webhook endpoint to update (e.g. `we_1abc23`)                      |
| `url`             | string   | no       | New HTTPS URL for the webhook endpoint                                       |
| `enabled_events`  | string[] | no       | New list of event types to subscribe to                                      |
| `description`     | string   | no       | Optional description for the webhook endpoint                                |
| `metadata`        | object   | no       | Set of key-value pairs to attach to the object                               |
| `disabled`        | boolean  | no       | If `true`, the endpoint is disabled and will not receive events             |

**Returns** — the updated Stripe WebhookEndpoint object.

**Stripe docs** — https://stripe.com/docs/api/webhook_endpoints/update

---

### stripe_webhooks_delete

Permanently delete a webhook endpoint. Use when the webhook receiver is
decommissioned or you want to stop all event delivery to a URL.

**Parameters**

| Param        | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `webhook_id` | string | yes      | ID of the webhook endpoint to delete (e.g. `we_1abc23`) |

**Returns** — the Stripe deletion response
`{ id, deleted: true, object: 'webhook_endpoint' }`.

**Stripe docs** — https://stripe.com/docs/api/webhook_endpoints/delete

---

### stripe_webhooks_list

List webhook endpoints with auto-pagination. Use when you want to audit
existing webhook configurations or find a webhook by URL or event
subscription.

**Parameters**

| Param            | Type    | Required | Description                                                       |
| ---------------- | ------- | -------- | ----------------------------------------------------------------- |
| `limit`          | integer | no       | Page size per request (max 100, default 100)                      |
| `starting_after` | string  | no       | Cursor: ID of the object to start after                           |
| `max_items`      | integer | no       | Hard cap on total items to fetch across all pages                 |

**Returns** — `{ total_count, has_more, data: WebhookEndpoint[] }`.

**Stripe docs** — https://stripe.com/docs/api/webhook_endpoints/list
