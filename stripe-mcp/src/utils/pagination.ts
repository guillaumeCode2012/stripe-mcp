import type Stripe from 'stripe';

/**
 * Auto-paginate through all cursor-based Stripe list responses.
 *
 * @param fetchPage  A function that fetches one page. It receives
 *                   `{ limit, starting_after }` and must return a Stripe
 *                   `ApiList<T>` (with `.data` and `.has_more`).
 * @param options    Optional `maxItems` cap to avoid runaway pagination.
 *
 * @example
 * const allCustomers = await paginateAll((p) => stripe.customers.list(p));
 */
export async function paginateAll<T>(
  fetchPage: (params: { limit: number; starting_after?: string }) => Promise<Stripe.ApiList<T>>,
  options?: { maxItems?: number },
): Promise<T[]> {
  const maxItems = options?.maxItems ?? 100_000;
  const pageSize = Math.min(100, maxItems);
  const results: T[] = [];
  let startingAfter: string | undefined;

  for (let i = 0; i < 1000; i++) {
    const page = await fetchPage({
      limit: Math.min(pageSize, maxItems - results.length),
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    const data = page.data;
    results.push(...data);

    if (!page.has_more || results.length >= maxItems) {
      break;
    }

    const last = data[data.length - 1];
    if (!last) break;
    // Stripe list items always carry an `id`. We cast through unknown because
    // the generic T does not constrain to `{ id: string }` but real resources do.
    startingAfter = (last as unknown as { id: string }).id;
  }

  return results.slice(0, maxItems);
}

/**
 * Build a summary envelope for a paginated list result.
 * Useful for analytics tools that return large computed datasets.
 */
export function listEnvelope<T>(data: T[], hasMore = false) {
  return {
    total_count: data.length,
    has_more: hasMore,
    next_cursor: null as string | null,
    data,
  };
}
