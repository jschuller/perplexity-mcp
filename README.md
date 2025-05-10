# Perplexity MCP Server

An enhanced MCP server for Perplexity AI that allows Claude Desktop and other MCP clients to search the web using Perplexity's powerful API. This server implements the full range of Perplexity API parameters, providing fine-grained control over search behavior and response generation.

## Features

- **Full Perplexity API support**: All parameters from the Perplexity API are exposed
- **Recency filtering**: Focus on results from the last day, week, month, or year
- **Advanced parameters**: Control temperature, top_k, top_p, frequency penalties, and more
- **Citations and images**: Option to include source citations and relevant images
- **Streaming support**: Enable incremental response streaming
- **Model selection**: Choose between different Perplexity models

## Installation

You can install this MCP server directly via npm/npx or from source:

### Option 1: Using npx (Recommended)

```bash
npx @jschuller/perplexity-mcp
```

### Option 2: Global Installation

```bash
npm install -g @jschuller/perplexity-mcp
```

### Option 3: From Source

```bash
git clone https://github.com/jschuller/perplexity-mcp.git
cd perplexity-mcp
npm install
npm run build
```

## Configuration

### Claude Desktop

Add this configuration to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@jschuller/perplexity-mcp"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key_here",
        "PERPLEXITY_MODEL": "sonar-large-online"
      }
    }
  }
}
```

For macOS, the config file is located at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

## Usage

Once configured, the MCP server provides a `perplexity_search_web` tool with the following parameters:

### Required Parameters

- `query` (string): The search query

### Optional Parameters

- `recency` (string): Filter results by time period - 'day', 'week', 'month', 'year' (default: 'month')
- `model` (string): The Perplexity model to use (default: 'sonar-large-online')
- `frequency_penalty` (number): Penalty for token frequency to avoid repetition
- `presence_penalty` (number): Penalty for token presence to encourage topic variety
- `max_tokens` (integer): Maximum number of tokens to generate
- `temperature` (number): Controls randomness (0 = deterministic, 2 = more random)
- `top_k` (integer): Limits high-probability tokens to consider
- `top_p` (number): Nucleus sampling threshold
- `return_citations` (boolean): Include source citations (default: true)
- `return_images` (boolean): Include relevant images (default: false)
- `stream` (boolean): Enable streaming responses (default: false)

## Environment Variables

- `PERPLEXITY_API_KEY` (required): Your Perplexity API key
- `PERPLEXITY_MODEL` (optional): Default model to use (default: 'sonar')

## Example Usage

In Claude Desktop, you can use commands like:

```
Search the web for the latest developments in quantum computing from the last week
```

The MCP server will automatically use the appropriate parameters to focus on recent results.

## Security Considerations

- Your Perplexity API key is kept secure in your local environment
- The MCP server only communicates with the official Perplexity API
- No data is stored or logged beyond what's necessary for the API calls

## Available Models

- `sonar`: The standard Perplexity model (default)
- `sonar-pro`: Enhanced model with better capabilities
- Other models as listed at: https://docs.perplexity.ai/guides/model-cards

## Troubleshooting

1. **API Key Issues**: Ensure your `PERPLEXITY_API_KEY` is correctly set in the configuration
2. **Connection Errors**: Check your internet connection and Perplexity API status
3. **MCP Server Not Found**: Make sure the package is properly installed and the command path is correct

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please file an issue on [GitHub](https://github.com/jschuller/perplexity-mcp/issues).
