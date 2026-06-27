import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We do NOT mock config here (we want the real stripeMode detection), but we
// must avoid getStripeClient() being called for the non-doctor tests — those
// flags never call it, so STRIPE_SECRET_KEY can be absent safely.

describe('handleCliArgs (non-doctor flags)', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let originalArgv: string[];

  beforeEach(() => {
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
    expect(await handleCliArgs(['node', 'stripe-mcp'])).toBe(false);
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it('prints help and returns true for --help', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '--help'])).toBe(true);
    expect(stderrSpy).toHaveBeenCalled();
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('stripe-mcp');
    expect(text).toContain('USAGE');
    expect(text).toContain('--list-tools');
    expect(text).toContain('--doctor');
  });

  it('prints help and returns true for -h alias', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '-h'])).toBe(true);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('prints version and returns true for --version', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '--version'])).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toMatch(/stripe-mcp\s+\d+\.\d+\.\d+/);
  });

  it('prints version for -v alias', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '-v'])).toBe(true);
  });

  it('emits valid JSON tool list to stdout for --list-tools', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '--list-tools'])).toBe(true);
    const text = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(79);
    expect(parsed[0]).toHaveProperty('name');
    expect(parsed[0]).toHaveProperty('description');
    for (const t of parsed) {
      expect(t.name).toMatch(/^stripe_[a-z]/);
      expect(typeof t.description).toBe('string');
    }
    expect(parsed.some((t: { name: string }) => t.name === 'stripe_analytics_get_mrr')).toBe(true);
  });

  it('emits a categories summary for --list-categories', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '--list-categories'])).toBe(true);
    const text = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty('total');
    expect(parsed.total).toBeGreaterThanOrEqual(79);
    expect(Array.isArray(parsed.categories)).toBe(true);
    const names = parsed.categories.map((c: { category: string }) => c.category);
    expect(names).toContain('customers');
    expect(names).toContain('analytics');
    expect(names).toContain('payment-intents');
    expect(names).toContain('billing-portal');
    expect(names).toContain('promotion-codes');
  });

  it('warns on stderr for unknown flags and returns false (falls through to server)', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    expect(await handleCliArgs(['node', 'stripe-mcp', '--bogus'])).toBe(false);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('unknown argument');
    expect(text).toContain('--help');
  });
});

// --doctor tests mock the Stripe client. We use a swappable plain-function
// holder (not vi.fn for the error path) to avoid vitest's vi.fn mock-throw
// resurfacing as test failures — the doctor's try/catch handles every error
// and resolves with a CheckResult, but vi.fn still tracks the throw. See
// DECISIONS.md 009.
describe('handleCliArgs --doctor', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  let originalArgv: string[];
  let originalKey: string | undefined;

  type BalanceImpl = () => unknown;
  type AccountImpl = () => unknown;
  let balanceImpl: BalanceImpl;
  let accountImpl: AccountImpl;

  beforeEach(() => {
    vi.resetModules();
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    originalArgv = process.argv;
    originalKey = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_doctor_test';
    // Start each test with a clean exit code (the doctor only sets it on
    // failure; on success it leaves the default, which is `undefined`).
    process.exitCode = 0;
    balanceImpl = async () => ({
      available: [{ amount: 12500, currency: 'usd' }],
      pending: [{ amount: 0, currency: 'usd' }],
    });
    accountImpl = async () => ({
      id: 'acct_test123',
      country: 'US',
      default_currency: 'usd',
      business_profile: { name: 'Acme Test Inc' },
    });
    vi.doMock('../../src/config.js', () => ({
      getStripeClient: () => ({
        balance: { retrieve: () => balanceImpl() },
        accounts: { retrieve: () => accountImpl() },
      }),
      resetStripeClient: () => {},
      config: { stripeMode: 'test' },
    }));
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    process.argv = originalArgv;
    if (originalKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalKey;
    vi.doUnmock('../../src/config.js');
    process.exitCode = 0;
  });

  it('runs all checks and reports success when key authenticates', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    const handled = await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    expect(handled).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('stripe-mcp doctor');
    expect(text).toContain('STRIPE_SECRET_KEY');
    expect(text).toContain('test mode');
    expect(text).toContain('Stripe API auth');
    expect(text).toContain('authenticated as acct_test123');
    expect(text).toContain('Tool catalogue');
    expect(text).toContain('79 tools');
    expect(text).toContain('Node.js version');
    expect(text).toContain('All checks passed');
    expect(process.exitCode).toBe(0);
  });

  it('formats the available balance in the auth detail line', async () => {
    const { handleCliArgs } = await import('../../src/cli.js');
    await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('available: 125.00 USD');
    expect(text).toContain('business: "Acme Test Inc"');
  });

  it('degrades gracefully when account.retrieve is forbidden', async () => {
    // Simulate a restricted key (rk_) that can read balance but not account.
    accountImpl = () => {
      throw { type: 'StripePermissionError', message: 'Insufficient permissions' };
    };
    const { handleCliArgs } = await import('../../src/cli.js');
    const handled = await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    expect(handled).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    // Auth check still passes (balance worked), account info just absent.
    expect(text).toContain('authenticated');
    expect(text).not.toContain('acct_test123');
    expect(text).toContain('All checks passed');
  });

  it('fails the auth check and exits 1 when balance.retrieve rejects', async () => {
    balanceImpl = () => {
      throw { type: 'StripeAuthenticationError', message: 'Invalid API Key provided' };
    };
    const { handleCliArgs } = await import('../../src/cli.js');
    const handled = await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    expect(handled).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('✗');
    expect(text).toContain('Authentication failed');
    expect(text).toContain('Some checks failed');
    expect(process.exitCode).toBe(1);
  });

  it('fails the env check when STRIPE_SECRET_KEY is unset', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { handleCliArgs } = await import('../../src/cli.js');
    const handled = await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    expect(handled).toBe(true);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('not set');
    expect(text).toContain('skipped');
    expect(text).toContain('Some checks failed');
    expect(process.exitCode).toBe(1);
  });

  it('warns about an unrecognised key prefix', async () => {
    process.env.STRIPE_SECRET_KEY = 'bogus_prefix_abc';
    const { handleCliArgs } = await import('../../src/cli.js');
    await handleCliArgs(['node', 'stripe-mcp', '--doctor']);
    const text = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(text).toContain('unrecognised prefix');
    expect(text).toContain('Some checks failed');
  });
});
