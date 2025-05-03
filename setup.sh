#!/bin/bash

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file. Please update it with your Perplexity API key."
  cp .env.example .env
fi

echo "Setup complete! To start the server, run: npm run serve"
echo "To integrate with Claude Desktop, add the configuration from README.md to your claude_desktop_config.json file."
