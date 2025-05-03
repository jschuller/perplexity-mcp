#!/usr/bin/env node

// Check if PERPLEXITY_API_KEY is set
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('\x1b[31mError: PERPLEXITY_API_KEY environment variable is required\x1b[0m');
  console.log('\x1b[33mPlease set it in your environment or in claude_desktop_config.json:\x1b[0m');
  console.log(`
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "npx",
      "args": [
        "@jschuller/perplexity-mcp"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key_here"
      }
    }
  }
}
  `);
  process.exit(1);
}

// Import and run the MCP server
import('./dist/index.js').catch(err => {
  console.error('\x1b[31mError loading the MCP server:\x1b[0m', err);
  console.error('\x1b[33mIf this is related to TypeScript compilation, try installing the package with:\x1b[0m');
  console.error('\x1b[36mnpm install -g typescript\x1b[0m');
  console.error('\x1b[36mnpm install -g @jschuller/perplexity-mcp\x1b[0m');
  process.exit(1);
});
