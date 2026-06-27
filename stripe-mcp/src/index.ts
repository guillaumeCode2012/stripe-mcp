import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { config } from './config.js';
import { handleCliArgs } from './cli.js';

async function main(): Promise<void> {
  // Handle --help / --version / --list-tools / --list-categories first.
  // These exit early and never start the stdio server.
  if (handleCliArgs(process.argv)) {
    return;
  }

  if (config.stripeMode === 'live') {
    console.error('⚠️  LIVE MODE — real money affected. Proceed with caution.');
  } else {
    console.error('✓ Test mode (no real charges).');
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('stripe-mcp running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting stripe-mcp:', error);
  process.exit(1);
});
