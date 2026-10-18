// Pure helpers for the perplexity_search_web tool: no I/O, so they can be tested
// without an API key or network access.

// Values Perplexity accepts for search_recency_filter
export const RECENCY_VALUES = ['hour', 'day', 'week', 'month', 'year'];

export interface SearchArgs {
  query: string;
  recency?: string;
  frequency_penalty?: number;
  max_tokens?: number;
  model?: string;
  presence_penalty?: number;
  return_citations?: boolean;
  return_images?: boolean;
  temperature?: number;
  top_k?: number;
  top_p?: number;
}

// Build the body for POST https://api.perplexity.ai/chat/completions
export function buildRequest(args: SearchArgs, defaultModel: string): Record<string, any> {
  const {
    query,
    recency,
    frequency_penalty,
    max_tokens,
    model = defaultModel,
    presence_penalty,
    return_citations = true,
    return_images = false,
    temperature,
    top_k,
    top_p
  } = args;

  if (recency !== undefined && !RECENCY_VALUES.includes(recency)) {
    throw new Error(`recency must be one of: ${RECENCY_VALUES.join(', ')}`);
  }

  // Build the messages array
  const messages = [
    {
      role: 'system',
      content: "You are a helpful assistant that searches the web to provide accurate, up-to-date information."
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
  if (recency !== undefined) apiRequest.search_recency_filter = recency;
  if (frequency_penalty !== undefined) apiRequest.frequency_penalty = frequency_penalty;
  if (max_tokens !== undefined) apiRequest.max_tokens = max_tokens;
  if (presence_penalty !== undefined) apiRequest.presence_penalty = presence_penalty;
  if (return_citations !== undefined) apiRequest.return_citations = return_citations;
  if (return_images !== undefined) apiRequest.return_images = return_images;
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
