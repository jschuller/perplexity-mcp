#!/usr/bin/env node

// This file is the entry point for UVX
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Check if PERPLEXITY_API_KEY is set
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('\x1b[31mError: PERPLEXITY_API_KEY environment variable is required\x1b[0m');
  console.log('\x1b[33mPlease set it in your environment or in claude_desktop_config.json:\x1b[0m');
  console.log(`
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "uvx",
      "args": [
        "perplexity-mcp"
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
import './dist/index.js';

console.log('\x1b[32mPerplexity MCP Server is running...\x1b[0m');
console.log('\x1b[36mEnhanced Deep Research parameters are enabled!\x1b[0m');
