import type Stripe from 'stripe';

/**
 * Convert any Stripe SDK error into a human-readable, actionable string.
 * Never throws — returns a fallback message for unknown error shapes.
 *
 * Each branch includes a concrete fix and a docs link so the LLM (and the
 * human behind it) knows exactly what to do next.
 *
 * Note: Stripe's error class type is exposed as `Stripe.errors.StripeError`
 * (a namespace), not `Stripe.Error`.
 */
export function formatStripeError(error: unknown): string {
  // Stripe errors carry a `type` discriminator. `Stripe.errors.StripeError`
  // is an instance type; we only need its shape for safe property access.
  const stripeError = error as Partial<Stripe.errors.StripeError> & {
    type?: string;
    message?: string;
    statusCode?: number;
    doc_url?: string;
    param?: string;
    requestId?: string;
  };

  if (!stripeError || typeof stripeError !== 'object') {
    return `Unknown error: ${String(error)}`;
  }

  const type = stripeError.type ?? 'unknown';
  const message = stripeError.message ?? 'No message provided by Stripe.';
  const param = stripeError.param ? `\n  - Invalid parameter: \`${stripeError.param}\`` : '';
  const doc = stripeError.doc_url ? `\n  - Docs: ${stripeError.doc_url}` : '';
  const requestId = stripeError.requestId ? `\n  - Request ID: ${stripeError.requestId}` : '';

  switch (type) {
    case 'StripeCardError':
      return [
        '❌ Card error — the card was declined or invalid.',
        `  - ${message}`,
        '  - How to fix: use a different card, or ask the customer to contact their bank.',
        '  - Decline codes: https://stripe.com/docs/declines/codes',
        doc,
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripeRateLimitError':
      return [
        '⏳ Rate limit exceeded — too many requests to Stripe.',
        '  - How to fix: wait a few seconds and retry. Reduce polling frequency.',
        '  - Rate limits: https://stripe.com/docs/rate-limits',
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripeInvalidRequestError':
      return [
        '🚫 Invalid request — a parameter was missing or malformed.',
        `  - ${message}`,
        param,
        '  - How to fix: correct the parameter and retry.',
        '  - API reference: https://stripe.com/docs/api',
        doc,
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripeAuthenticationError':
      return [
        '🔐 Authentication failed — your Stripe secret key is invalid or expired.',
        '  - How to fix: generate a new key at https://dashboard.stripe.com/apikeys',
        '  - Make sure STRIPE_SECRET_KEY is set correctly (starts with sk_test_ or sk_live_).',
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripeAPIError':
      return [
        '⚠️ Stripe API error — something went wrong on Stripe\'s side.',
        `  - ${message}`,
        '  - How to fix: retry with exponential backoff. If it persists, check https://status.stripe.com/',
        '  - Support: https://support.stripe.com/',
        doc,
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripeConnectionError':
      return [
        '🔌 Connection error — network failure communicating with Stripe.',
        `  - ${message}`,
        '  - How to fix: check your network/DNS, then retry. Verify https://status.stripe.com/',
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    case 'StripePermissionError':
      return [
        '🚫 Permission denied — your key lacks the required scope for this operation.',
        `  - ${message}`,
        '  - How to fix: use a key with broader permissions, or restrict the operation to an allowed account.',
        requestId,
      ]
        .filter(Boolean)
        .join('\n');

    default:
      return [
        `❌ Stripe error (${type}):`,
        `  - ${message}`,
        param,
        doc,
        requestId,
        `  - Status code: ${stripeError.statusCode ?? 'n/a'}`,
      ]
        .filter(Boolean)
        .join('\n');
  }
}
