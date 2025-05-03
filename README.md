# Perplexity MCP Server for Deep Research

This is a Model Context Protocol (MCP) server for integrating Perplexity AI's web search capabilities with Claude Desktop and VSCode Roo Extension, optimized for Deep Research tasks.

[![npm version](https://img.shields.io/npm/v/@jschuller/perplexity-mcp.svg)](https://www.npmjs.com/package/@jschuller/perplexity-mcp)
[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/jschuller/perplexity-mcp)

## Features

- Enhanced parameters for Deep Research tasks
- Support for recency filtering (day, week, month, year)
- Control over generation parameters (temperature, tokens, etc.)
- Citation support
- Optimized for research tasks

## Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Perplexity API key

### Installation

#### Option 1: Install and Run Globally (Recommended for Claude Desktop)

Install the package globally:

```bash
npm install -g @jschuller/perplexity-mcp
```

Or use uvx directly without installation:

```bash
uvx @jschuller/perplexity-mcp
```

#### Option 2: Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/jschuller/perplexity-mcp.git
   cd perplexity-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Perplexity API key to the `.env` file:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

### Running the Server

#### Using uvx (for Claude Desktop)

Simply use uvx to run the package:

```bash
uvx @jschuller/perplexity-mcp
```

The PERPLEXITY_API_KEY environment variable must be set.

#### Using Node.js (for development)

```bash
npm start
```

#### Using Docker

Build the Docker image:

```bash
docker build -t @jschuller/perplexity-mcp .
```

Run the Docker container:

```bash
docker run -p 8000:8000 -e PERPLEXITY_API_KEY=your_api_key_here @jschuller/perplexity-mcp
```

### Integrating with Claude Desktop

Add the following configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity-mcp": {
      "command": "uvx",
      "args": [
        "@jschuller/perplexity-mcp"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your_perplexity_api_key_here"
      }
    }
  }
}
```

## Available Parameters

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| query | The search query to execute | "latest advances in quantum computing" |
| recency | Filter results by time period | "day", "week", "month", "year" |
| frequency_penalty | Penalty for token frequency to avoid repetition | 0.5, 1.0, 1.5 |
| max_tokens | Maximum tokens to generate | 100, 500, 1000 |
| model | Model name for generating completions | "sonar-small-online", "sonar-medium-online", "sonar-large-online" |
| presence_penalty | Penalty based on token presence for topic variety | -2.0, 0.0, 2.0 |
| return_citations | Include citations in response | true, false |
| return_images | Include images in response | true, false |
| stream | Stream response incrementally | true, false |
| temperature | Control randomness (0 = deterministic) | 0.0, 0.7, 1.5 |
| top_k | Limit high-probability tokens considered | 0, 40, 80 |
| top_p | Nucleus sampling threshold | 0.1, 0.9, 1.0 |

## Example Usage in Claude

```
I'd like to research quantum computing breakthroughs using perplexity_search_web with:
- query: "latest advances in quantum computing"
- recency: "month"
- model: "sonar-large-online"
- temperature: 0.3
- return_citations: true
- max_tokens: 1000
```

## Implementation Details

This package implements the Model Context Protocol (MCP) for the Perplexity API, making it compatible with Claude Desktop and Roo Code. It provides a JSON-RPC compatible interface that follows the MCP specification, allowing Claude to access Perplexity's web search capabilities with enhanced parameters for Deep Research.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Credits

Based on the Model Context Protocol specification.
