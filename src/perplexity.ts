// Pure helpers for the perplexity_search_web tool: no I/O, so they can be tested
// without an API key or network access.

export interface SearchArgs {
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
}

// Build the body for POST https://api.perplexity.ai/chat/completions
export function buildRequest(args: SearchArgs, defaultModel: string): Record<string, any> {
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

  return apiRequest;
}

// Turn the API's JSON response into the tool result
export function formatResponse(result: any, model: string) {
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
}
