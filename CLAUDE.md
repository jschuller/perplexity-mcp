# CLAUDE.md — Perplexity MCP Server

## Project Overview

MCP server that connects Claude (Desktop/Code) to Perplexity AI's web search API. Published as `@jschuller/perplexity-mcp` on npm. ~200 monthly downloads, 6 stars.

- **Language**: TypeScript (strict mode)
- **Transport**: stdio (MCP standard)
- **SDK**: `@modelcontextprotocol/sdk` v1.27+ (upgraded from 0.5.0 in v2.1.0)
- **Entry points**: `bin.js` (npm/npx) → `dist/index.js` (compiled) ← `src/index.ts` (source)
- **One tool**: `perplexity_search_web` with 12 parameters

## Commands

```bash
npm run build        # Compile TypeScript → dist/
npm run start        # Run locally with .env
npm publish          # Publish to npm (use GitHub release instead — triggers CI)
npm audit            # Check for dependency vulnerabilities
```

## Release Process

Releases are automated via GitHub Actions:
1. Bump version in `package.json` and `src/index.ts` (server version)
2. Update `CHANGELOG.md`
3. Commit, push to main
4. Create GitHub release: `gh release create v2.x.x --title "v2.x.x" --notes "..."`
5. The `publish.yml` workflow auto-publishes to npm with provenance

**npm token**: Granular access token (`perplexity-mcp-publish`) stored as `NPM_TOKEN` secret. Scoped to this package only, expires June 2026. Renew at npmjs.com/settings/jschuller/tokens.

## Architecture

Simple single-file server (`src/index.ts`):
- Lines 1-11: Imports + API key validation (exits if missing)
- Lines 17-27: Server instance with MCP SDK `Server` class
- Lines 30-108: `ListToolsRequestSchema` handler — defines the tool's JSON Schema
- Lines 111-225: `CallToolRequestSchema` handler — builds Perplexity API request, calls API, formats response
- Lines 228-232: Stdio transport connection

## Key Decisions

- **Server class (not McpServer)**: Uses the lower-level `Server` API. Works fine with SDK 1.x. Could migrate to `McpServer` + Zod schemas in a future refactor.
- **node-fetch**: Used instead of native fetch for Node 18 compatibility.
- **No tests**: Simple wrapper — tested manually via MCP client protocol. CI validates build + audit.
- **Granular npm token** (not Trusted Publishing): npm doesn't support tokenless OIDC like PyPI. Token is scoped to this package only with 2FA bypass for CI.

## Supply Chain Security

- GitHub Actions SHA-pinned in all workflows
- Renovate Bot configured for automated dependency updates (auto-merges patch/minor)
- npm publish includes `--provenance` for OIDC attestation
- `SECURITY.md` with vulnerability disclosure process
