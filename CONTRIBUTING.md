# Contributing to Perplexity MCP Server

Thank you for your interest in contributing to the Perplexity MCP Server! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Add your Perplexity API key to the `.env` file

## Project Structure

```
perplexity-mcp/
├── src/
│   └── index.ts      # Main server implementation
├── dist/             # Compiled JavaScript (generated)
├── bin.js           # Entry point for npx execution
├── package.json     # Package configuration
└── tsconfig.json    # TypeScript configuration
```

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the server locally (for testing)
- `npm publish` - Publish to npm (requires permissions)

## Testing Changes

1. Build the project:
   ```bash
   npm run build
   ```

2. Test locally:
   ```bash
   node bin.js
   ```

3. Test with Claude Desktop:
   - Update your `claude_desktop_config.json` to point to your local build
   - Restart Claude Desktop

## Code Style

- We use TypeScript for type safety
- Follow the existing code style
- Keep the code simple and readable
- Document any new parameters or features

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Update the README.md if needed
4. Bump the version in `package.json` following semantic versioning
5. Create a Pull Request with a clear description of changes

## Adding New Features

When adding new Perplexity API parameters:

1. Add the parameter to the tool's `inputSchema` in `src/index.ts`
2. Add TypeScript types for the parameter
3. Handle the parameter in the API request
4. Update the README.md documentation
5. Test thoroughly with different parameter combinations

## Release Process

1. Update version in `package.json`
2. Update README.md if needed
3. Build the project: `npm run build`
4. Publish to npm: `npm publish`
5. Create a GitHub release with changelog

## Questions?

Feel free to open an issue for any questions or discussions about contributing.
