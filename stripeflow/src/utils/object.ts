/**
 * Build a Stripe SDK params object from a zod-parsed input, dropping any
 * keys whose value is `undefined`.
 *
 * Why this exists: the project enables `exactOptionalPropertyTypes`, under
 * which an object with `{ email: undefined }` is NOT assignable to a Stripe
 * params type that declares `email?: string`. zod's `.optional()` produces
 * `string | undefined`, so we filter undefineds here and cast to the target
 * params type. Runtime behaviour is identical (Stripe ignores undefined keys
 * anyway), but this keeps TypeScript strict and the codebase cast-free.
 *
 * @example
 * const customer = await stripe.customers.create(
 *   buildStripeParams<Stripe.CustomerCreateParams>(parsed.data),
 * );
 */
export function buildStripeParams<P>(obj: Record<string, unknown>): P {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as P;
}
