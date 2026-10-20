# Changelog

## [Unreleased]

This release has breaking changes and should ship as **3.0.0**.

### Changed
- **BREAKING:** `recency` has no default. It used to default to `month`, so every query was nudged toward the last month; omit it now for no time limit. It is sent as Perplexity's `search_recency_filter` instead of a hint in the system prompt, accepts `hour`, `day`, `week`, `month`, `year`, and rejects other values
- **BREAKING:** sources and images are appended to the text content (a numbered `Sources:` list from the top-level `search_results`, falling back to the deprecated `citations`, and an `Images:` list when `return_images` is set) instead of being returned under `meta`
- `return_citations` is no longer sent to the API (Perplexity always returns sources); it controls whether the `Sources:` list is appended
- The publish workflow installs npm 11.21.0 instead of `npm@latest`, so a release never runs an npm version that came out the same day

### Removed
- **BREAKING:** the `meta` field of the tool result, including `meta.model` and `meta.usage`, which clients did receive. Its `citations` and `images` were read from `choices[0].message`, where Perplexity does not put them, so they were always empty
- **BREAKING:** the `stream` parameter. The server parsed the reply as one JSON body, so `stream: true` made the API return server-sent events and the call failed; an MCP tool result is returned whole anyway. `stream` is never sent to the API

### Fixed
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
