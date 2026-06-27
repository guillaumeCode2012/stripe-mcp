import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { config } from './config.js';

async function main(): Promise<void> {
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
