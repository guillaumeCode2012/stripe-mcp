import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * A stripe-mcp tool definition.
 * - `definition` is the MCP tool manifest (name, description, JSON schema).
 * - `execute` runs the tool against the Stripe API and returns a string result
 *   (JSON.stringify of the Stripe response, or a human-readable error string).
 *
 * Tools MUST never throw — they always return a string so the MCP client gets
 * a usable message even on failure.
 */
export interface ToolDefinition {
  definition: Tool;
  execute: (input: unknown) => Promise<string>;
}

/**
 * Standard JSON-Schema property descriptor used to mirror zod schemas into the
 * MCP `inputSchema`. Keeping this typed avoids `any` while staying flexible.
 */
export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

export interface JsonSchemaObject {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}
