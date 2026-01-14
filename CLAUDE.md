# Invoice Search MCP Server - AI Context

## Project Overview
This MCP server enables Claude to search for invoices by reference number through a RESTful API with HTTP Basic Authentication.

## Project Purpose
- Single-purpose tool: search invoices by reference
- Simple integration with invoice cache API
- Demonstrates MCP server patterns for HTTP API integration

## Architecture

### Three-Layer Design
1. **Types Layer** (`types.ts`): Interface definitions
2. **Client Layer** (`mcp-client.ts`): HTTP communication
3. **Server Layer** (`index.ts`): MCP protocol implementation

### Data Flow
1. Claude sends search_invoice tool call with reference parameter
2. MCP server validates input (non-empty string check)
3. FreeagentInvoiceCacheClient sends GET request to /api/invoices?reference={ref}
4. API returns JSON with invoices array and metadata
5. Server formats response as MCP text content

## Key Design Patterns

### Environment-Based Configuration
- All API credentials from environment variables
- Validation at startup (fail-fast principle)
- No hardcoded URLs or credentials

### Logging Strategy
- All logs to stderr (stdout reserved for MCP protocol)
- Prefix pattern: `[InvoiceCache]` or `[InvoiceSearch]`
- Structured logging with context objects
- Log both successful operations and errors

### Error Handling
- HTTP errors converted to descriptive messages
- Input validation with clear error text
- Error responses include `isError: true` flag
- Stack traces logged but not exposed to user

### Input Validation
- Type checking (must be object, must have string reference)
- Empty string rejection (trim before check)
- Schema-level validation (JSON Schema in tool definition)

## Key Technologies
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **axios**: HTTP client with interceptors
- **TypeScript**: Type-safe development
- **ES Modules**: Modern JavaScript module system

## File Structure

```
freeagent-mcp-invoice-search/
├── src/
│   ├── types.ts              # TypeScript interfaces
│   ├── mcp-client.ts         # HTTP client (FreeagentInvoiceCacheClient)
│   └── index.ts              # MCP server (InvoiceSearchServer)
├── .env.example              # Environment variable template
├── .gitignore                # Git exclusions
├── CLAUDE.md                 # This file
├── README.md                 # User documentation
├── package.json              # NPM configuration
└── tsconfig.json             # TypeScript configuration
```

## Development Guide

### Setup
```bash
npm install
npm run build
```

### Testing Locally
```bash
# Set environment variables
export INVOICE_API_URL="https://your-api.com"
export API_TOKEN="your-token"

# Run server
node build/index.js
```

### Adding to Claude Desktop
Add to MCP settings:
```json
{
  "mcpServers": {
    "invoice-search": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "INVOICE_API_URL": "https://your-api.com",
        "API_TOKEN": "your-token"
      }
    }
  }
}
```

### Extending Functionality

#### Adding New Search Parameters
1. Update `SearchParams` interface in types.ts
2. Modify `validateSearchParams()` in index.ts
3. Update tool schema in `ListToolsRequestSchema` handler
4. Pass new parameters in client method

#### Adding Additional Tools
1. Define new types in types.ts
2. Add client method in mcp-client.ts
3. Register tool in ListToolsRequestSchema handler
4. Add handler method following pattern

## Code Conventions
- Use class-based architecture for encapsulation
- Prefix all log messages with context tag
- Validate inputs before processing
- Use async/await (no raw promises)
- Type everything explicitly (no implicit any)

## Testing Considerations
- Test with various reference formats (INV-011, 100056, etc.)
- Test empty string rejection
- Test missing environment variables
- Test API timeout scenarios
- Test malformed API responses

## Common Issues

### "INVOICE_API_URL is required"
- Set environment variable before starting server
- Check MCP settings include env block

### "401 Unauthorized"
- Verify API_TOKEN is correct
- Check API_USERNAME if not using default

### No results returned
- API returns empty invoices array (count: 0)
- This is not an error - invoice not found

## API Integration

### Endpoint
- **GET** `/api/invoices`
- Query parameter: `reference` (invoice reference number)

### Authentication
- HTTP Basic Auth
- Username: From `API_USERNAME` env var (default: "api")
- Password: From `API_TOKEN` env var

### Response Format
```json
{
  "invoices": [
    {
      "id": 123,
      "reference": "INV-011",
      "customer_name": "Acme Corp",
      "amount": 1500.00,
      "currency": "GBP",
      "status": "paid"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

## Implementation Details

### Class: FreeagentInvoiceCacheClient (src/mcp-client.ts)
- Wraps axios for HTTP communication
- Handles authentication via axios auth config
- 30-second timeout for requests
- Error interceptor for consistent logging
- Type-safe error handling with `axios.isAxiosError()`

### Class: InvoiceSearchServer (src/index.ts)
- Orchestrates MCP server lifecycle
- Validates environment variables at startup
- Registers single tool: `search_invoice`
- Validates input parameters before API call
- Formats responses as MCP text content
- Handles graceful shutdown on SIGINT

## Future Enhancement Possibilities

While out of scope for initial implementation, these could be added later:

1. **Additional Search Parameters**: Filter by date, customer, amount range
2. **List All Invoices**: Retrieve invoices without reference filter
3. **Invoice Details**: Get single invoice by ID
4. **Pagination Support**: Handle limit/offset for large result sets
5. **Response Caching**: Cache recent searches (with TTL)
6. **Retry Logic**: Automatic retry on transient failures
7. **Rate Limiting**: Respect API rate limits
8. **Metrics**: Track search frequency, response times

## Troubleshooting

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check TypeScript version matches package.json
- Verify tsconfig.json paths are correct

### Runtime Errors
- Check environment variables are set
- Verify API endpoint is accessible
- Review logs in stderr for error details
- Test API endpoint directly with curl/postman

### MCP Integration Issues
- Verify build/index.js is executable (chmod +x)
- Check MCP settings JSON is valid
- Restart Claude Desktop after configuration changes
- Review Claude Desktop logs for connection errors
