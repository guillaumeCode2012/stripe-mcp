import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { allTools } from './tools/index.js';

/**
 * Build and configure the MCP server with all stripe-mcp tools registered.
 * Exposed as a factory so tests can construct isolated instances.
 */
export function createServer(): Server {
  const server = new Server(
    { name: 'stripe-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map((t) => t.definition),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const tool = allTools.find((t) => t.definition.name === name);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
    try {
      const result = await tool.execute(request.params.arguments ?? {});
      // A tool returns a string. If it starts with ❌/🚫/⚠️ etc. treat as error.
      const isError = /^(❌|🚫|⚠️|🔐|⏳|🔌|Validation error:|Unknown error:)/.test(result);
      return {
        content: [{ type: 'text', text: result }],
        isError,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Unexpected error executing ${name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
