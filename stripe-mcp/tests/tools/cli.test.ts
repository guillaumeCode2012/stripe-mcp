import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We do NOT mock config here (we want the real stripeMode detection), but we
// must avoid getStripeClient() being called — handleCliArgs never calls it,
// so the STRIPE_SECRET_KEY env can be absent safely.

describe('handleCliArgs', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let originalArgv: string[];

  beforeEach(() => {
    // Re-import the module fresh each test so module-level consts re-evaluate.
    vi.resetModules();
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    originalArgv = process.argv;
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.argv = originalArgv;
  });

  it('returns false for no args (server should start)', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp'])).toBe(false);
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('prints help and returns true for --help', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '--help'])).toBe(true);
    expect(stderrSpy).toHaveBeenCalled();
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('stripe-mcp');
    expect(text).toContain('USAGE');
    expect(text).toContain('--list-tools');
  });

  it('prints help and returns true for -h alias', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '-h'])).toBe(true);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('prints version and returns true for --version', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '--version'])).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toMatch(/stripe-mcp\s+\d+\.\d+\.\d+/);
  });

  it('prints version for -v alias', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '-v'])).toBe(true);
  });

  it('emits valid JSON tool list to stdout for --list-tools', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '--list-tools'])).toBe(true);
    const text = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(79);
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('description');
    // Every tool name follows the stripe_<category>_<action> convention.
    for (const t of parsed) {
      expect(t.name).toMatch(/^stripe_[a-z]/);
      expect(typeof t.description).toBe('string');
    }
    // Sanity: the MRR analytics tool is present.
    expect(parsed.some((t: { name: string }) => t.name === 'stripe_analytics_get_mrr')).toBe(true);
  });

  it('emits a categories summary for --list-categories', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '--list-categories'])).toBe(true);
    const text = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty('total');
    expect(parsed.total).toBeGreaterThanOrEqual(79);
    expect(Array.isArray(parsed.categories)).toBe(true);
    // Should include the 19 known categories (display form, hyphenated).
    const names = parsed.categories.map((c: { category: string }) => c.category);
    expect(names).toContain('customers');
    expect(names).toContain('analytics');
    expect(names).toContain('payment-intents');
    expect(names).toContain('billing-portal');
    expect(names).toContain('promotion-codes');
  });

  it('warns on stderr for unknown flags and returns false (falls through to server)', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(handleCliArgs(['node', 'stripe-mcp', '--bogus'])).toBe(false);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('unknown argument');
    expect(text).toContain('--help');
  });
});
