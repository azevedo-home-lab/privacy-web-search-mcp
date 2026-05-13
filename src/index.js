#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { search } from './search-engines.js';
import { logResults, logError, getLogPath } from './logger.js';

const server = new Server({
  name: 'privacy-web-search',
  version: '2.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'web_search',
    description: 'Search the web using privacy-focused search engines (DuckDuckGo, Qwant, Startpage). All searches are logged for audit purposes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
          minimum: 1,
          maximum: 20
        },
      },
      required: ['query'],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'web_search') {
    const query = request.params.arguments.query;
    const limit = request.params.arguments.limit || 10;

    try {
      const results = await search(query, limit);

      // Log results for audit
      logResults(query, results);

      // Format results for Claude
      const formattedResults = results.map((r, i) =>
        `${i + 1}. **${r.title}**\n   URL: ${r.url}\n   ${r.content}\n   Source: ${r.source}\n`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `Found ${results.length} results:\n\n${formattedResults}\n\n_All searches are logged to: ${getLogPath()}_`,
        }],
      };
    } catch (error) {
      logError(query, error);

      return {
        content: [{
          type: 'text',
          text: `Search failed: ${error.message}\n\nPlease try again or rephrase your query.`,
        }],
        isError: true,
      };
    }
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

// Log startup
console.error(`Privacy Web Search MCP Server v2.0.0`);
console.error(`Logs: ${getLogPath()}`);
console.error(`Using: DuckDuckGo, Qwant, Startpage (with automatic fallback)`);
