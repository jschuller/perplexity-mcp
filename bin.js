#!/usr/bin/env node

// Set MCP mode for proper communication protocol
process.env.MCP_MODE = 'true';

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
  process.stderr.write(`Error loading the MCP server: ${err.message}\n`);
  process.stderr.write('If this is related to TypeScript compilation, try installing the package with:\n');
  process.stderr.write('npm install -g typescript\n');
  process.stderr.write('npm install -g @jschuller/perplexity-mcp\n');
  process.exit(1);
});
