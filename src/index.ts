#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FreeagentInvoiceCacheClient } from './mcp-client.js';
import { InvoiceSearchConfig, SearchParams } from './types.js';

class InvoiceSearchServer {
  private server: Server;
  private client: FreeagentInvoiceCacheClient;

  constructor() {
    // Validate environment variables at startup
    const config = this.validateConfig();

    // Initialize client
    this.client = new FreeagentInvoiceCacheClient(config);

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'invoice-search-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register handlers
    this.setupHandlers();

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      console.error('[InvoiceSearch] Shutting down...');
      await this.server.close();
      process.exit(0);
    });
  }

  // Environment variable validation
  private validateConfig(): InvoiceSearchConfig {
    const apiUrl = process.env.INVOICE_API_URL;
    const apiUsername = process.env.API_USERNAME || 'api';
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl) {
      throw new Error('INVOICE_API_URL environment variable is required');
    }

    if (!apiToken) {
      throw new Error('API_TOKEN environment variable is required');
    }

    console.error('[InvoiceSearch] Configuration loaded:', {
      apiUrl,
      apiUsername,
      hasToken: !!apiToken,
    });

    return { apiUrl, apiUsername, apiToken };
  }

  // Setup MCP handlers
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_invoice',
          description: 'Search for invoices by reference number. Returns matching invoices with details.',
          inputSchema: {
            type: 'object',
            properties: {
              reference: {
                type: 'string',
                description: 'Invoice reference number (e.g., "INV-011", "100056", "INV145001")',
                minLength: 1,
              },
            },
            required: ['reference'],
          },
        },
        {
          name: 'check_health',
          description: 'Check the health status of the invoice API and database connection.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_stats',
          description: 'Get statistics about the invoice cache, including total counts and status breakdown.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error('[InvoiceSearch] Tool called:', request.params.name);

      try {
        if (request.params.name === 'search_invoice') {
          return await this.handleSearchInvoice(request.params.arguments);
        }

        if (request.params.name === 'check_health') {
          return await this.handleCheckHealth();
        }

        if (request.params.name === 'get_stats') {
          return await this.handleGetStats();
        }

        throw new Error(`Unknown tool: ${request.params.name}`);
      } catch (error) {
        console.error('[InvoiceSearch] Tool execution failed:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Search invoice handler with validation
  private async handleSearchInvoice(args: unknown) {
    // Validate input
    const params = this.validateSearchParams(args);

    // Execute search
    const result = await this.client.searchInvoice(params);

    // Format response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  // Health check handler
  private async handleCheckHealth() {
    const result = await this.client.getHealth();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  // Stats handler
  private async handleGetStats() {
    const result = await this.client.getStats();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  // Input validation
  private validateSearchParams(args: unknown): SearchParams {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments: must be an object');
    }

    const { reference } = args as Record<string, unknown>;

    if (typeof reference !== 'string') {
      throw new Error('Invalid reference: must be a string');
    }

    if (reference.trim() === '') {
      throw new Error('Invalid reference: cannot be empty');
    }

    return { reference: reference.trim() };
  }

  // Start the server
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[InvoiceSearch] Server started and ready');
  }
}

// Main execution
const server = new InvoiceSearchServer();
server.run().catch((error) => {
  console.error('[InvoiceSearch] Fatal error:', error);
  process.exit(1);
});
