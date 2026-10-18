# Changelog

## [Unreleased]

### Fixed
- `recency` now sets Perplexity's `search_recency_filter` instead of adding a hint to the system prompt, and has no default: before, every query was nudged toward the last month. Accepts `hour`, `day`, `week`, `month`, `year`; other values are rejected
- Removed the `stream` parameter. The server parsed the reply as one JSON body, so `stream: true` made the API return server-sent events and the call failed; an MCP tool result is returned whole anyway. `stream` is never sent to the API
- Citations and images now reach the client. They were read from `choices[0].message`, where Perplexity does not put them, and returned under a non-standard `meta` key that clients ignore. The server now reads the top-level `citations` (falling back to `search_results`) and `images`, and appends a numbered `Sources:` list, and image URLs when `return_images` is set, to the text. The `meta` field is gone
- `return_citations` is no longer sent to the API (Perplexity always returns sources); it controls whether the `Sources:` list is appended
- A response without `choices[0].message.content` gives a clear error instead of a TypeError

### Added
- Tests (`npm test`, `node --test`) for the request builder, the response formatter and the tool schema over stdio, run in CI after the build

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
