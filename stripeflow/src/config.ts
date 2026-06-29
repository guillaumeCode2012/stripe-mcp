import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Lazily construct (and cache) the Stripe client from the
 * STRIPE_SECRET_KEY environment variable.
 *
 * Throws a clear, actionable error if the key is missing so the MCP
 * client surfaces it instead of a cryptic auth failure.
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is required. Get yours at https://dashboard.stripe.com/apikeys',
      );
    }
    // We intentionally do NOT pin `apiVersion`. The Stripe SDK's config type
    // restricts it to a single `LatestApiVersion` literal that changes every
    // release; pinning a stale string would fail typecheck, and pinning the
    // current literal would break on the next SDK upgrade. Omitting it lets
    // Stripe use the version bundled with the installed SDK (the latest
    // stable), which is Stripe's recommended default unless you are mid-
    // migration. See DECISIONS.md 008.
    stripeClient = new Stripe(apiKey, {
      appInfo: { name: 'StripeFlow', version: '1.0.0' },
      typescript: true,
    });
  }
  return stripeClient;
}

/** Reset the cached client — primarily for tests. */
export function resetStripeClient(): void {
  stripeClient = null;
}

export const config = {
  stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
} as const;
