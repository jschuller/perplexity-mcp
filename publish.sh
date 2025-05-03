#!/bin/bash

# ANSI color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Publishing @jschuller/perplexity-mcp${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if user is logged in to npm
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: You are not logged in to npm.${NC}"
    echo -e "${YELLOW}Please run 'npm login' first.${NC}"
    exit 1
fi

# Check for dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please check your npm installation.${NC}"
    exit 1
fi

# Build the package
echo -e "${YELLOW}Building package before publishing...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo -e "${RED}Build completed but dist directory was not created.${NC}"
    echo -e "${YELLOW}Please check your tsconfig.json and try again.${NC}"
    exit 1
fi

# Publish the package
echo -e "${YELLOW}Publishing package to npm registry...${NC}"
npm publish --access public

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Package published successfully!${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${YELLOW}To use in Claude Desktop, add to claude_desktop_config.json:${NC}"
    echo -e "${BLUE}"
    echo '{
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
}'
    echo -e "${NC}"
    echo -e "${YELLOW}To install globally:${NC}"
    echo -e "npm install -g @jschuller/perplexity-mcp"
    echo -e "${YELLOW}To run directly with uvx:${NC}"
    echo -e "uvx @jschuller/perplexity-mcp"
    echo -e "${BLUE}=====================================${NC}"
else
    echo -e "${RED}Publishing failed.${NC}"
    echo -e "${YELLOW}Check the error message above and try again.${NC}"
fi
