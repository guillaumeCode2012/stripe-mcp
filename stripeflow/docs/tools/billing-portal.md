# Billing Portal

Create a Stripe Customer Portal session. The Customer Portal is a
Stripe-hosted page where customers self-manage their subscriptions, payment
methods, and billing details without you building a UI.

All tools validate input with zod and return the Stripe BillingPortal Session
object as pretty-printed JSON on success or a human-readable error string on
failure.

---

### stripe_billing_portal_create_session

Create a short-lived Stripe Customer Portal session URL for a customer to
self-manage subscriptions and billing details. Use when a customer wants to
update their payment method or subscription plan, you need to deep-link the
customer into a specific portal flow (e.g. cancel a subscription), or you are
building an account/billing page in your app.

**Parameters**

| Param           | Type   | Required | Description                                                                                                                                      |
| --------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `customer`      | string | yes      | The ID of an existing customer who will access the billing portal                                                                                |
| `return_url`    | string | no       | URL the customer is redirected to after leaving the portal                                                                                        |
| `configuration` | string | no       | ID of a portal configuration to use. If omitted, the default configuration is used.                                                              |
| `flow_data`     | object | no       | Deep-link flow config (e.g. `{ type: "subscription_cancel", subscription_cancel: { subscription: "sub_..." } }). See Stripe portal deep-links docs. |

**Returns** — the Stripe Billing Portal Session object (id, url, customer,
return_url).

**Stripe docs** — https://stripe.com/docs/api/customer_portal/sessions/create ·
Deep-links: https://stripe.com/docs/customer-management/portal/deep-links
