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
npm test             # node --test against dist/ (build first)
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

- `src/index.ts`: API key check (exits if missing), the MCP `Server`, the tool's JSON Schema
  (`tools/list`), the `tools/call` handler, and the stdio transport
- `src/search.ts`: one search call: argument checks, the API request with a timeout
  (`PERPLEXITY_TIMEOUT_MS`, default 60 s), and every failure returned as a tool result with
  `isError: true`; `fetch` is injected so tests mock it
- `src/perplexity.ts`: pure helpers that build the request body and format the response

## Key Decisions

- **Server class (not McpServer)**: Uses the lower-level `Server` API. Works fine with SDK 1.x. Could migrate to `McpServer` + Zod schemas in a future refactor.
- **node-fetch**: Used instead of native fetch for Node 18 compatibility.
- **Tests**: `npm test` (after `npm run build`) runs `node --test` on `tests/perplexity.test.mjs` (the pure request/response helpers in `src/perplexity.ts` plus stdio `tools/list` and `tools/call` smoke tests) and `tests/search.test.mjs` (`src/search.ts` with a mocked fetch: errors, timeouts, bad responses); no API key or network. CI runs build + test + audit.
- **npm Trusted Publishing (OIDC)**: `publish.yml` publishes with the job's OIDC token and no npm token (the repository has no secrets); npm documents it as needing npm 11.5.1+ and Node 22.14.0+ (the workflow pins npm 11.21.0 and Node 22.23.3).

## Supply Chain Security

- GitHub Actions SHA-pinned in all workflows
- Dependabot version updates (`.github/dependabot.yml`): npm and GitHub Actions, weekly, after a 7-day cooldown (14 for an npm major); every update is a reviewed PR
- npm publish includes `--provenance` for OIDC attestation
- `SECURITY.md` with vulnerability disclosure process
