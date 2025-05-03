#!/bin/bash

# ANSI color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Perplexity MCP Server Installer${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${YELLOW}This script will install the Perplexity MCP server for use with UVX${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js v18 or higher from https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher.${NC}"
    echo -e "${YELLOW}Current version: ${NODE_VERSION}${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    echo -e "${YELLOW}Please install npm (usually comes with Node.js)${NC}"
    exit 1
fi

echo -e "${GREEN}Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Building the TypeScript code...${NC}"
npm run build

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${YELLOW}To run with UVX in Claude Desktop:${NC}"
echo -e "1. Add this to your claude_desktop_config.json:"
echo -e "${BLUE}"
echo '{
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
}'
echo -e "${NC}"
echo -e "2. Replace \"your_perplexity_api_key_here\" with your actual Perplexity API key"
echo -e "3. Restart Claude Desktop"
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}For local testing, run: npm run serve${NC}"
echo -e "${BLUE}=====================================${NC}"
