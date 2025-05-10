# Changelog

## [2.0.1] - 2025-05-10

### Fixed
- Updated default model from 'sonar-large-online' to 'sonar' to match current Perplexity API
- Updated model descriptions in documentation to reflect available models

### Changed
- Improved error handling for invalid model names

## [2.0.0] - 2025-05-10

### Changed
- Complete rewrite to use the official MCP SDK
- Switched from HTTP server to stdio transport (MCP standard)
- Improved TypeScript types and error handling
- Moved tsx to regular dependencies for runtime support

### Added
- Proper MCP server implementation using `@modelcontextprotocol/sdk`
- Type-safe parameter handling
- Better error messages

### Removed
- Custom HTTP server implementation
- Docker support (using npm/npx instead)
- Unnecessary setup scripts
- Deprecated installation methods

### Fixed
- Transport protocol issues with Claude Desktop
- TypeScript compilation errors
- Package structure for npm distribution

## [1.0.3] - Previous version
- Initial implementation with custom HTTP server
