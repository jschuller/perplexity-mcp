#!/bin/bash

# ANSI color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}GitHub Repository Setup${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed.${NC}"
    echo -e "${YELLOW}Please install Git from https://git-scm.com/${NC}"
    exit 1
fi

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to initialize Git repository.${NC}"
        exit 1
    fi
fi

# Check if remote already exists
REMOTE_EXISTS=$(git remote -v | grep origin | wc -l)
if [ $REMOTE_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}Adding remote repository...${NC}"
    git remote add origin https://github.com/jschuller/perplexity-mcp.git
else
    echo -e "${YELLOW}Remote repository already exists.${NC}"
fi

# Add all files to Git
echo -e "${YELLOW}Adding files to Git...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Initial commit: Perplexity MCP server with enhanced Deep Research parameters"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
echo -e "${YELLOW}Note: You may be prompted for your GitHub credentials.${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${YELLOW}Your repository is now available at:${NC}"
    echo -e "${GREEN}https://github.com/jschuller/perplexity-mcp${NC}"
    echo -e "${BLUE}=====================================${NC}"
else
    echo -e "${RED}Failed to push to GitHub.${NC}"
    echo -e "${YELLOW}Please check your GitHub credentials and try again.${NC}"
    echo -e "${YELLOW}You can manually push with:${NC}"
    echo -e "git push -u origin main"
    echo -e "${BLUE}=====================================${NC}"
fi
