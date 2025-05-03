import dotenv from 'dotenv';
import fetch from 'node-fetch';
import http from 'http';

// Load environment variables from .env file if present
dotenv.config();

// Get API key from environment
const apiKey = process.env.PERPLEXITY_API_KEY;
if (!apiKey) {
  console.error('\x1b[31mError: PERPLEXITY_API_KEY environment variable is required\x1b[0m');
  process.exit(1);
}

// Define interfaces for typing
interface PerplexityRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
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
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
      citations?: any[];
      images?: any[];
    };
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface JsonRpcRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params: any;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// Log server startup with enhanced output
console.log('\x1b[34m====================================\x1b[0m');
console.log('\x1b[32mPerplexity Deep Research MCP Server\x1b[0m');
console.log('\x1b[34m====================================\x1b[0m');
console.log('\x1b[36mOptimized for Claude Desktop & Roo Code\x1b[0m');

// Create a simple HTTP server to handle JSON-RPC requests
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const rpcRequest = JSON.parse(body) as JsonRpcRequest;
        
        // Handle ping method
        if (rpcRequest.method === 'ping') {
          const response: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: rpcRequest.id,
            result: 'pong'
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
          return;
        }
        
        // Handle list_tools method
        if (rpcRequest.method === 'list_tools') {
          const response: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: rpcRequest.id,
            result: [
              {
                name: 'perplexity_search_web',
                description: 'Search the web using Perplexity AI with recency filtering',
                parameters: {
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
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
          return;
        }
        
        // Handle perplexity_search_web method
        if (rpcRequest.method === 'perplexity_search_web') {
          console.log('\x1b[33mProcessing search request...\x1b[0m');
          
          const params = rpcRequest.params;
          const { 
            query, 
            recency = 'month',
            frequency_penalty,
            max_tokens,
            model = 'sonar-large-online',
            presence_penalty,
            return_citations = true,
            return_images = false,
            stream = false,
            temperature,
            top_k,
            top_p
          } = params;
          
          // Log the request parameters for debugging
          console.log(`\x1b[36mQuery: "${query}"\x1b[0m`);
          console.log(`\x1b[36mRecency: ${recency}\x1b[0m`);
          if (model) console.log(`\x1b[36mModel: ${model}\x1b[0m`);
          
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
          const apiRequest: PerplexityRequest = {
            messages: messages
          };
          
          // Add optional parameters if provided
          if (frequency_penalty !== undefined) apiRequest.frequency_penalty = frequency_penalty;
          if (max_tokens !== undefined) apiRequest.max_tokens = max_tokens;
          if (model !== undefined) apiRequest.model = model;
          if (presence_penalty !== undefined) apiRequest.presence_penalty = presence_penalty;
          if (return_citations !== undefined) apiRequest.return_citations = return_citations;
          if (return_images !== undefined) apiRequest.return_images = return_images;
          if (stream !== undefined) apiRequest.stream = stream;
          if (temperature !== undefined) apiRequest.temperature = temperature;
          if (top_k !== undefined) apiRequest.top_k = top_k;
          if (top_p !== undefined) apiRequest.top_p = top_p;
          
          console.log('\x1b[33mSending request to Perplexity API...\x1b[0m');
          
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
              console.error(`\x1b[31mPerplexity API error: ${response.status} ${response.statusText}\x1b[0m`, errorData);
              
              const errorResponse: JsonRpcResponse = {
                jsonrpc: '2.0',
                id: rpcRequest.id,
                error: {
                  code: -32603,
                  message: `Perplexity API error: ${response.status} ${response.statusText}`,
                  data: errorData
                }
              };
              
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(errorResponse));
              return;
            }
            
            const result = await response.json() as PerplexityResponse;
            console.log('\x1b[32mReceived response from Perplexity API\x1b[0m');
            
            // Process and format the response to highlight citations if available
            let formattedResponse = result.choices[0].message.content;
            
            // Log token usage
            if (result.usage) {
              console.log(`\x1b[36mToken usage: ${result.usage.total_tokens} (${result.usage.prompt_tokens} prompt, ${result.usage.completion_tokens} completion)\x1b[0m`);
            }
            
            // Format response for MCP
            const mcpResponse: JsonRpcResponse = {
              jsonrpc: '2.0',
              id: rpcRequest.id,
              result: {
                content: formattedResponse,
                model: result.model || model,
                usage: result.usage,
                citations: result.choices[0].message.citations || [],
                images: result.choices[0].message.images || []
              }
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mcpResponse));
          } catch (error: any) {
            console.error('\x1b[31mError in perplexity_search_web:\x1b[0m', error);
            
            const errorResponse: JsonRpcResponse = {
              jsonrpc: '2.0',
              id: rpcRequest.id,
              error: {
                code: -32603,
                message: `Error executing perplexity_search_web: ${error.message}`
              }
            };
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errorResponse));
          }
          
          return;
        }
        
        // Unsupported method
        const errorResponse: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          error: {
            code: -32601,
            message: `Method not found: ${rpcRequest.method}`
          }
        };
        
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
      } catch (error: any) {
        console.error('\x1b[31mError processing request:\x1b[0m', error);
        
        const errorResponse: JsonRpcResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error'
          }
        };
        
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server on port 8000
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\x1b[32mServer running on port ${PORT}\x1b[0m`);
  console.log('\x1b[32mServer ready for requests!\x1b[0m');
  console.log('\x1b[34m====================================\x1b[0m');
});
