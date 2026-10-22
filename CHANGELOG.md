# Changelog

## [Unreleased]

### Changed
- **Result text format change** (for clients that parse the text): results are marked as untrusted web content. The text starts with a notice that it is data, not instructions, and the answer, sources and image URLs follow between `<untrusted_web_content id="...">` and `</untrusted_web_content id="...">`, with a random id for each result. Web text cannot produce the closing tag for its own block, because it cannot know the id. Otherwise the text is unchanged, except that Unicode Tags-block characters and bidi controls are removed and our tag written as ASCII markup is replaced with `[removed tag]`. Error results wrap any part of Perplexity's response body the same way. The tool description says the results are untrusted
- The README's Claude Code quickstart passes the key with `claude mcp add perplexity -e PERPLEXITY_API_KEY=... -- npx -y @jschuller/perplexity-mcp`. The old `export` step only worked if Claude Code was started from that same shell
- CI audits at `--audit-level=high`. The step stays non-blocking for now: on main the runtime tree has high and critical advisories (`@modelcontextprotocol/sdk` <=1.31.0 and its transitive `proxy-addr`, `fast-uri`, `hono`, `ip-address`, `path-to-regexp`), fixed by a pending Dependabot update; a TODO in `ci.yml` marks where to make it blocking
- Tool failures are returned as a tool result with `isError: true` and a short explanation (API errors with the status and a hint for 401/403, 429 and 5xx, timeouts, network errors, a body that is not JSON, a response without content, bad arguments), instead of being thrown as MCP protocol errors, so the calling model sees what went wrong. An API key with a space, tab or line break gets its own hint. An unknown tool name is still a protocol error
- The publish workflow runs on Node 22.23.3 (LTS) instead of Node 20.20.2 (end of life), by exact version; npm documents trusted publishing as needing Node 22.14.0 or newer
- Dependabot replaces Renovate (the Renovate app was never installed): weekly update PRs for npm and the GitHub Actions, each after a 7-day cooldown (14 for an npm major); nothing auto-merges
- An unknown tool name is rejected with an MCP `InvalidParams` error (-32602) instead of an internal error

### Added
- A timeout on each Perplexity request, including reading the response: 60 seconds by default, set with `PERPLEXITY_TIMEOUT_MS` (whole milliseconds from 1 to 2147483647; another value gives the default and a warning on stderr). A stalled connection no longer hangs the tool call

## [3.0.0] - 2026-10-20

This release has breaking changes.

### Changed
- **BREAKING:** `recency` has no default. It used to default to `month`, so every query was nudged toward the last month; omit it now for no time limit. It is sent as Perplexity's `search_recency_filter` instead of a hint in the system prompt, accepts `hour`, `day`, `week`, `month`, `year`, and rejects other values
- **BREAKING:** sources and images are appended to the text content (a numbered `Sources:` list from the top-level `search_results`, falling back to the deprecated `citations`, and an `Images:` list when `return_images` is set) instead of being returned under `meta`
- `return_citations` is no longer sent to the API (Perplexity always returns sources); it controls whether the `Sources:` list is appended
- The publish workflow installs npm 11.21.0 instead of `npm@latest`, so a release never runs an npm version that came out the same day
- CI and the publish workflow install with `npm ci --ignore-scripts`, publish on Node 20.20.2 by exact version, pin every action by commit SHA, keep no token in the checkout and grant each job only what it needs; Renovate waits 7 days before proposing a release

### Removed
- **BREAKING:** the `meta` field of the tool result, including `meta.model` and `meta.usage`, which clients did receive. Its `citations` and `images` were read from `choices[0].message`, where Perplexity does not put them, so they were always empty
- **BREAKING:** the `stream` parameter. The server parsed the reply as one JSON body, so `stream: true` made the API return server-sent events and the call failed; an MCP tool result is returned whole anyway. `stream` is never sent to the API

### Fixed
- A response without `choices[0].message.content` gives a clear error instead of a TypeError
- The publish workflow runs when a release is published, not when it is created, so a release saved as a draft first still publishes to npm

### Added
- Requests to the Perplexity API send an `X-Pplx-Integration: perplexity-mcp` header so Perplexity can attribute traffic to this server
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
