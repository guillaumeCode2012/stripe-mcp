# Tax

Create, retrieve, and list Stripe tax rates. Tax rates define a percentage
applied to invoices and subscriptions — use them for jurisdictions not covered
by Stripe Tax automatic calculation. For automatic location-based tax, use the
`automatic_tax` field on Checkout Sessions and Payment Links instead.

All tools validate input with zod and return the Stripe TaxRate object as
pretty-printed JSON on success or a human-readable error string on failure.
`stripe_tax_list_rates` auto-paginates and wraps results as
`{ total_count, has_more, data }`.

---

### stripe_tax_create_rate

Create a manual tax rate with a display name, percentage, and
inclusive/exclusive flag. Use for jurisdictions not covered by Stripe Tax
automatic calculation.

**Parameters**

| Param          | Type    | Required | Description                                                                  |
| -------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `display_name` | string  | yes      | Display name of the tax rate, shown to users (e.g. `Sales Tax`, `VAT`)      |
| `percentage`   | number  | yes      | Tax rate percentage out of 100 (e.g. `8.5` for 8.5%)                        |
| `inclusive`    | boolean | yes      | Whether the tax is inclusive (already in the listed price) or exclusive     |
| `description`  | string  | no       | Internal description of the tax rate. Not shown to customers                |
| `jurisdiction` | string  | no       | Jurisdiction label (e.g. `US-CA`, `EU`). Appears on customer invoices       |
| `active`       | boolean | no       | Whether the tax rate is active. Defaults to `true`.                         |
| `metadata`     | object  | no       | Key-value pairs for internal use                                             |

**Returns** — the created Stripe TaxRate object.

**Stripe docs** — https://stripe.com/docs/api/tax_rates/create

---

### stripe_tax_get_rate

Retrieve the details of an existing tax rate by ID. Use to inspect a tax
rate's percentage, jurisdiction, and active flag.

**Parameters**

| Param         | Type   | Required | Description                                  |
| ------------- | ------ | -------- | -------------------------------------------- |
| `tax_rate_id` | string | yes      | The tax rate ID (e.g. `txr_...`)             |

**Returns** — the full Stripe TaxRate object including percentage,
jurisdiction, and active flag.

**Stripe docs** — https://stripe.com/docs/api/tax_rates/retrieve

---

### stripe_tax_list_rates

List tax rates with an optional active filter. Auto-paginates up to
`max_items`.

**Parameters**

| Param            | Type    | Required | Description                                                                |
| ---------------- | ------- | -------- | -------------------------------------------------------------------------- |
| `limit`          | integer | no       | Page size (1–100)                                                          |
| `active`         | boolean | no       | Filter to only active (`true`) or archived (`false`) tax rates             |
| `starting_after` | string  | no       | Cursor: ID of the last tax rate from the previous page                     |
| `max_items`      | integer | no       | Cap on total tax rates returned (default 100, max 1000)                    |

**Returns** — `{ total_count, has_more, data: TaxRate[] }`.

**Stripe docs** — https://stripe.com/docs/api/tax_rates/list
