# Changelog

## [2.1.0] - 2026-03-24

### Security
- Upgraded `@modelcontextprotocol/sdk` from 0.5.0 to 1.27.1 — fixes ReDoS (GHSA-8r9q-7v3j-jr4g) and DNS rebinding (GHSA-w48q-cv73-mx4w) vulnerabilities
- Added CI workflow with SHA-pinned GitHub Actions
- Added Renovate for automated dependency maintenance
- Added SECURITY.md with vulnerability disclosure process

### Fixed
- Fixed JSON Schema validation error with Claude Code (closes #1, merges #2) — removed invalid `required: false` on individual properties

### Changed
- Improved README with badges, Claude Code integration docs, tool reference table, and troubleshooting guide

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
