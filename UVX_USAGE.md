# Using @jschuller/perplexity-mcp with UVX

This guide explains how to use the enhanced Perplexity MCP server with UVX for both Claude Desktop and Roo Code Extension.

## What is UVX?

UVX is a command-line tool that allows for faster package execution compared to NPX. It's recommended for running MCP servers due to its speed and performance benefits.

## Setting Up with Claude Desktop

### Step 1: Install UVX (if not already installed)

```bash
# Using npm
npm install -g uvx

# Using bun
bun install -g uvx
```

### Step 2: Configure Claude Desktop

Edit your `claude_desktop_config.json` file (typically located in your user directory) to include:

```json
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "uvx",
      "args": [
        "@jschuller/perplexity-mcp"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key_here"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to apply the configuration changes.

## Setting Up with Roo Code

### Step 1: Install UVX (if not already installed)

Same as above.

### Step 2: Configure Roo Code Extension

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "Roo Code"
3. Find the "MCP Servers" configuration
4. Add the following configuration:

```json
{
  "perplexity-mcp": {
    "command": "uvx",
    "args": [
      "@jschuller/perplexity-mcp"
    ],
    "env": {
      "PERPLEXITY_API_KEY": "your_perplexity_api_key_here"
    }
  }
}
```

### Step 3: Restart VS Code

Restart VS Code to apply the changes.

## Using Advanced Parameters in Prompts

When using Claude Desktop or Roo Code, you can leverage all the advanced parameters for Deep Research:

```
I'd like to research quantum computing using perplexity_search_web with:
- query: "latest advances in quantum computing"
- recency: "week"
- model: "sonar-large-online"
- temperature: 0.2
- return_citations: true
- max_tokens: 1500
```

## Optimized Parameter Sets for Different Use Cases

### For Deep Research (Comprehensive Information)
```
perplexity_search_web with:
- query: "your specific research question"
- recency: "month"
- model: "sonar-large-online"
- temperature: 0.2
- max_tokens: 2000
- return_citations: true
```

### For Latest News (Recent Information)
```
perplexity_search_web with:
- query: "your news topic"
- recency: "day"
- model: "sonar-medium-online"
- temperature: 0.5
- max_tokens: 1000
- return_citations: true
```

### For Quick Answers (Efficient Responses)
```
perplexity_search_web with:
- query: "your specific question"
- recency: "week"
- model: "sonar-small-online"
- temperature: 0.7
- max_tokens: 500
- return_citations: true
```

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your Perplexity API key is valid and correctly set in your configuration file.

2. **UVX Not Found**: If you get a "command not found" error for UVX, make sure it's installed globally.

3. **Connection Issues**: If Claude can't connect to the MCP server, try:
   - Checking that the server has started correctly
   - Restarting Claude Desktop or VS Code
   - Checking your firewall settings

### Getting Help

If you encounter issues, check the logs in:
- Claude Desktop: Click on the settings icon and select "View Logs"
- Roo Code: Check the output panel in VS Code

## Example Workflows

### Academic Research Workflow
1. Start with a broad query to get an overview
2. Follow up with specific aspects using more targeted queries
3. Use the "month" recency for a balance of relevance and comprehensiveness

### Development Information Workflow
1. Use "week" recency for rapidly evolving tech topics
2. Set higher max_tokens (1500+) for detailed explanations
3. Use lower temperature (0.2-0.3) for more deterministic responses

### Current Events Workflow
1. Always use "day" recency for breaking news
2. Follow up with "week" recency for context and analysis
3. Use higher temperature (0.5-0.7) for more diverse perspectives
