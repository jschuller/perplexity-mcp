<!-- mcp-server: perplexity | tools: 1 | transport: stdio | auth: api_key -->

<h1 align="center">Perplexity MCP Server</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@jschuller/perplexity-mcp"><img src="https://img.shields.io/npm/v/@jschuller/perplexity-mcp?color=CB3837&label=npm" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@jschuller/perplexity-mcp"><img src="https://img.shields.io/npm/dm/@jschuller/perplexity-mcp?color=CB3837&label=downloads" alt="Downloads"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933" alt="Node.js"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-SDK%201.x-5436DA" alt="MCP SDK"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License"></a>
  <a href="https://github.com/jschuller/perplexity-mcp/actions/workflows/ci.yml"><img src="https://github.com/jschuller/perplexity-mcp/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  Search the web from Claude Desktop, Claude Code, or any MCP client using Perplexity AI —<br>
  with fine-grained control over recency, citations, images, and model parameters.
</p>

---

## What This Does

This MCP server connects AI assistants to [Perplexity AI](https://www.perplexity.ai/)'s search API. Ask questions in natural language and get grounded, cited answers from the live web — directly inside Claude or any MCP-compatible client.

**One tool, full control:** `perplexity_search_web` exposes the complete Perplexity API — recency filtering, model selection, temperature, top_k/top_p, citation/image toggles, and streaming.

## Getting Started

### 1. Get a Perplexity API Key

Sign up at [perplexity.ai](https://www.perplexity.ai/) and generate an API key from your [account settings](https://www.perplexity.ai/settings/api).

### 2. Install & Configure

#### Claude Code (Recommended)

```bash
claude mcp add perplexity -- npx -y @jschuller/perplexity-mcp
```

Then set your API key:
```bash
export PERPLEXITY_API_KEY=pplx-your-key-here
```

#### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@jschuller/perplexity-mcp"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-your-key-here"
      }
    }
  }
}
```

Config location:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### From Source

```bash
git clone https://github.com/jschuller/perplexity-mcp.git
cd perplexity-mcp
npm install && npm run build
```

### 3. Verify

Ask Claude: *"Search the web for the latest developments in quantum computing from the last week"*

## Tool Reference

### `perplexity_search_web`

| Parameter | Type | Default | Description |
|---|---|---|---|
| **`query`** | string | *(required)* | Search query |
| `recency` | `day` \| `week` \| `month` \| `year` | `month` | Filter results by time period |
| `model` | string | `sonar` | Perplexity model ([model cards](https://docs.perplexity.ai/guides/model-cards)) |
| `temperature` | number | — | Randomness (0 = deterministic, 2 = creative) |
| `max_tokens` | integer | — | Maximum tokens to generate |
| `top_k` | integer | — | Limit high-probability token pool (0 = disable) |
| `top_p` | number | — | Nucleus sampling threshold |
| `frequency_penalty` | number | — | Penalize repeated tokens |
| `presence_penalty` | number | — | Encourage topic variety |
| `return_citations` | boolean | `true` | Include source citations |
| `return_images` | boolean | `false` | Include relevant images |
| `stream` | boolean | `false` | Stream response incrementally |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PERPLEXITY_API_KEY` | Yes | — | Your Perplexity API key |
| `PERPLEXITY_MODEL` | No | `sonar` | Default model for all queries |

## Available Models

- **`sonar`** — Standard model (default)
- **`sonar-pro`** — Enhanced capabilities
- See full list: [Perplexity Model Cards](https://docs.perplexity.ai/guides/model-cards)

## Security

- API key stays in your local environment — never sent anywhere except the Perplexity API
- The server communicates only with `api.perplexity.ai` over HTTPS
- No data is stored or logged beyond the API request lifecycle
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## Troubleshooting

| Issue | Fix |
|---|---|
| `PERPLEXITY_API_KEY is required` | Set the env var in your MCP client config or shell |
| `400 invalid_request_error` | Update to v2.1.0+ (fixes JSON Schema validation with Claude Code) |
| Server not found | Verify `npx @jschuller/perplexity-mcp` runs without error |
| Connection timeout | Check internet connectivity and [Perplexity API status](https://status.perplexity.ai/) |

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
