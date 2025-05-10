#!/usr/bin/env node

// Check if PERPLEXITY_API_KEY is set
if (!process.env.PERPLEXITY_API_KEY) {
  process.stderr.write('Error: PERPLEXITY_API_KEY environment variable is required\n');
  process.stderr.write('Please set it in your environment or in claude_desktop_config.json:\n');
  process.stderr.write(`
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "npx",
      "args": [
        "-y", 
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

// Load the transpiled server
import('./dist/index.js').catch(err => {
  process.stderr.write(`Error loading the MCP server: ${err.message}\n`);
  process.exit(1);
});
