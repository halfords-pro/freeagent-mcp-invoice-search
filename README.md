# Invoice Search MCP Server

A Model Context Protocol (MCP) server that enables Claude to search for invoices by reference number.

## Features

- Search invoices by reference number (e.g., 'INV-011', '100056', 'INV145001')
- HTTP Basic Authentication support
- Configurable API endpoint
- Simple JSON response format
- Built with TypeScript for type safety

## Prerequisites

- Node.js 18 or higher
- Access to an invoice API endpoint
- API authentication token

## Installation

1. Clone this repository:
```bash
git clone https://github.com/your-org/freeagent-mcp-invoice-search.git
cd freeagent-mcp-invoice-search
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file or set the following environment variables:

- `INVOICE_API_URL` (required): Base URL of your invoice API
- `API_TOKEN` (required): Authentication token for the API
- `API_USERNAME` (optional): Username for Basic Auth (defaults to "api")

### MCP Settings

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "invoice-search": {
      "command": "node",
      "args": ["/absolute/path/to/freeagent-mcp-invoice-search/build/index.js"],
      "env": {
        "INVOICE_API_URL": "https://your-invoice-api.com",
        "API_TOKEN": "your-api-token-here",
        "API_USERNAME": "api"
      }
    }
  }
}
```

## Usage

Once configured, Claude can search invoices using natural language:

- "Search for invoice INV-011"
- "Find invoice with reference 100056"
- "Look up invoice INV145001"

### Tool: search_invoice

**Parameters:**
- `reference` (string, required): The invoice reference number to search for

**Response Format:**
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

## API Requirements

Your invoice API must:

- Accept GET requests to `/api/invoices`
- Support `reference` query parameter
- Use HTTP Basic Authentication
- Return JSON in the format:
  ```json
  {
    "invoices": [...],
    "count": number,
    "limit": number,
    "offset": number
  }
  ```

## Development

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Watch Mode

Automatically rebuild on file changes:
```bash
npm run watch
```

### Debugging

The server logs diagnostic information to stderr. You can view these logs in your terminal or MCP client:

```bash
# Run server directly to see logs
export INVOICE_API_URL="https://your-api.com"
export API_TOKEN="your-token"
node build/index.js
```

## Project Structure

```
freeagent-mcp-invoice-search/
├── src/
│   ├── types.ts              # TypeScript interfaces
│   ├── mcp-client.ts         # HTTP client
│   └── index.ts              # MCP server
├── build/                    # Compiled JavaScript (generated)
├── .env.example              # Environment variable template
├── CLAUDE.md                 # AI context documentation
├── README.md                 # This file
├── package.json              # NPM configuration
└── tsconfig.json             # TypeScript configuration
```

## Troubleshooting

### Server won't start

- Check that all required environment variables are set
- Verify Node.js version is 18 or higher: `node --version`
- Check file permissions on `build/index.js`
- Review error messages in console output

### No results found

- Verify the invoice reference exists in your system
- Check API credentials are correct
- Review server logs for API errors
- Test API endpoint directly with curl:
  ```bash
  curl -u "api:your-token" "https://your-api.com/api/invoices?reference=INV-011"
  ```

### Authentication errors

- Confirm `API_TOKEN` is valid
- Verify `API_USERNAME` matches your API requirements
- Check API endpoint is accessible from your network

### MCP Integration Issues

- Verify `build/index.js` exists after running `npm run build`
- Check MCP settings JSON is valid
- Restart Claude Desktop after configuration changes
- Review Claude Desktop logs for connection errors

## Technical Details

### Architecture

The server follows a three-layer architecture:

1. **Types Layer** (`types.ts`): TypeScript interfaces for type safety
2. **Client Layer** (`mcp-client.ts`): HTTP client with axios for API communication
3. **Server Layer** (`index.ts`): MCP protocol implementation and tool registration

### Error Handling

- Input validation with clear error messages
- HTTP errors include status codes
- All errors logged to stderr with context
- Graceful handling of API timeouts (30 second timeout)

### Logging

All logs use stderr (stdout is reserved for MCP protocol):

- `[InvoiceCache]` prefix for HTTP client logs
- `[InvoiceSearch]` prefix for server logs
- Structured logging with context objects

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or pull request.

## Related Projects

- [freeagent-mcp](https://github.com/halfords-pro/freeagent-mcp) - Reference MCP server implementation
- [freeagent-invoice-cache](https://github.com/halfords-pro/freeagent-invoice-cache) - Invoice cache API

## Support

For issues and questions:
- Open an issue on GitHub
- Check CLAUDE.md for detailed architecture documentation
- Review the troubleshooting section above
