import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Get API key from environment
const apiKey = process.env.PERPLEXITY_API_KEY;
if (!apiKey) {
  process.stderr.write('Error: PERPLEXITY_API_KEY environment variable is required\n');
  process.exit(1);
}

// Default model to use
const defaultModel = process.env.PERPLEXITY_MODEL || 'sonar-large-online';

// Create the server instance
const server = new Server(
  {
    name: 'perplexity-mcp',
    version: '1.0.0',
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
              enum: ['day', 'week', 'month', 'year'],
              default: 'month',
              description: 'Filter results by recency'
            },
            frequency_penalty: {
              type: 'number',
              description: 'Multiplicative penalty for new tokens based on their frequency in the text to avoid repetition. Mutually exclusive with the presence_penalty parameter.',
              required: false
            },
            max_tokens: {
              type: 'integer',
              description: 'The maximum number of tokens to generate. Sum of max_tokens and prompt tokens should not exceed the model\'s context window limit.',
              required: false
            },
            model: {
              type: 'string',
              description: 'The name of the model to use for generating completions. Options include sonar-small-online, sonar-medium-online, and sonar-large-online.',
              required: false
            },
            presence_penalty: {
              type: 'number',
              description: 'Penalty for new tokens based on their current presence in the text, encouraging topic variety. Mutually exclusive with the frequency_penalty parameter.',
              required: false
            },
            return_citations: {
              type: 'boolean',
              description: 'Whether to include citations in the model\'s response.',
              default: true,
              required: false
            },
            return_images: {
              type: 'boolean',
              description: 'Whether to include images in the model\'s response.',
              default: false,
              required: false
            },
            stream: {
              type: 'boolean',
              description: 'Whether to stream the response incrementally using server-sent events.',
              default: false,
              required: false
            },
            temperature: {
              type: 'number',
              description: 'Controls generation randomness, with 0 being deterministic and values approaching 2 being more random.',
              required: false
            },
            top_k: {
              type: 'integer',
              description: 'Limits the number of high-probability tokens to consider for generation. Set to 0 to disable.',
              required: false
            },
            top_p: {
              type: 'number',
              description: 'Nucleus sampling threshold, controlling the token selection pool based on cumulative probability.',
              required: false
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

  const args = request.params.arguments as {
    query: string;
    recency?: string;
    frequency_penalty?: number;
    max_tokens?: number;
    model?: string;
    presence_penalty?: number;
    return_citations?: boolean;
    return_images?: boolean;
    stream?: boolean;
    temperature?: number;
    top_k?: number;
    top_p?: number;
  };

  if (!args || typeof args.query !== 'string') {
    throw new Error('Query is required and must be a string');
  }

  const { 
    query, 
    recency = 'month',
    frequency_penalty,
    max_tokens,
    model = defaultModel,
    presence_penalty,
    return_citations = true,
    return_images = false,
    stream = false,
    temperature,
    top_k,
    top_p
  } = args;

  // Construct system message with recency instruction
  let systemContent = "You are a helpful assistant that searches the web to provide accurate, up-to-date information.";
  
  if (recency) {
    systemContent += ` Focus on results from the last ${recency}.`;
  }
  
  // Build the messages array
  const messages = [
    {
      role: 'system',
      content: systemContent
    },
    {
      role: 'user',
      content: query
    }
  ];
  
  // Build API request
  const apiRequest: Record<string, any> = {
    messages: messages,
    model: model
  };
  
  // Add optional parameters if provided
  if (frequency_penalty !== undefined) apiRequest.frequency_penalty = frequency_penalty;
  if (max_tokens !== undefined) apiRequest.max_tokens = max_tokens;
  if (presence_penalty !== undefined) apiRequest.presence_penalty = presence_penalty;
  if (return_citations !== undefined) apiRequest.return_citations = return_citations;
  if (return_images !== undefined) apiRequest.return_images = return_images;
  if (stream !== undefined) apiRequest.stream = stream;
  if (temperature !== undefined) apiRequest.temperature = temperature;
  if (top_k !== undefined) apiRequest.top_k = top_k;
  if (top_p !== undefined) apiRequest.top_p = top_p;
  
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
    
    // Process and format the response
    const formattedResponse = result.choices[0].message.content;
    
    return {
      content: [
        {
          type: 'text',
          text: formattedResponse
        }
      ],
      meta: {
        model: result.model || model,
        usage: result.usage,
        citations: result.choices[0].message.citations || [],
        images: result.choices[0].message.images || []
      }
    };
    
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
