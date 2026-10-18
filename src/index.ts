import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import { buildRequest, formatResponse, RECENCY_VALUES, SearchArgs } from './perplexity.js';

// Get API key from environment
const apiKey = process.env.PERPLEXITY_API_KEY;
if (!apiKey) {
  process.stderr.write('Error: PERPLEXITY_API_KEY environment variable is required\n');
  process.exit(1);
}

// Default model to use
const defaultModel = process.env.PERPLEXITY_MODEL || 'sonar';

// Create the server instance
const server = new Server(
  {
    name: 'perplexity-mcp',
    version: '2.1.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the perplexity_search_web tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'perplexity_search_web',
        description: 'Search the web using Perplexity AI with recency filtering',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            recency: {
              type: 'string',
              enum: RECENCY_VALUES,
              description: 'Only return search results from this time period (Perplexity search_recency_filter). Omit for no time limit.'
            },
            frequency_penalty: {
              type: 'number',
              description: 'Multiplicative penalty for new tokens based on their frequency in the text to avoid repetition. Mutually exclusive with the presence_penalty parameter.',
            },
            max_tokens: {
              type: 'integer',
              description: 'The maximum number of tokens to generate. Sum of max_tokens and prompt tokens should not exceed the model\'s context window limit.',
            },
            model: {
              type: 'string',
              description: 'The name of the model to use for generating completions. Options include sonar, sonar-pro, and other models listed at https://docs.perplexity.ai/guides/model-cards',
            },
            presence_penalty: {
              type: 'number',
              description: 'Penalty for new tokens based on their current presence in the text, encouraging topic variety. Mutually exclusive with the frequency_penalty parameter.',
            },
            return_citations: {
              type: 'boolean',
              description: 'Whether to include citations in the model\'s response.',
              default: true,
            },
            return_images: {
              type: 'boolean',
              description: 'Whether to include images in the model\'s response.',
              default: false,
            },
            temperature: {
              type: 'number',
              description: 'Controls generation randomness, with 0 being deterministic and values approaching 2 being more random.',
            },
            top_k: {
              type: 'integer',
              description: 'Limits the number of high-probability tokens to consider for generation. Set to 0 to disable.',
            },
            top_p: {
              type: 'number',
              description: 'Nucleus sampling threshold, controlling the token selection pool based on cumulative probability.',
            }
          },
          required: ['query']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'perplexity_search_web') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments as unknown as SearchArgs;

  if (!args || typeof args.query !== 'string') {
    throw new Error('Query is required and must be a string');
  }

  const apiRequest = buildRequest(args, defaultModel);

  try {
    // Make API call to Perplexity
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorData}`);
    }
    
    const result = await response.json() as any;

    return formatResponse(result, apiRequest.model);
    
  } catch (error: any) {
    throw new Error(`Error in perplexity_search_web: ${error.message}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  process.stderr.write(`Server error: ${error}\n`);
  process.exit(1);
});
