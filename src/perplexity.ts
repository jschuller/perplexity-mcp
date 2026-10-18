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
  if (return_images !== undefined) apiRequest.return_images = return_images;
  if (temperature !== undefined) apiRequest.temperature = temperature;
  if (top_k !== undefined) apiRequest.top_k = top_k;
  if (top_p !== undefined) apiRequest.top_p = top_p;

  return apiRequest;
}

export interface FormatOptions {
  returnCitations: boolean;
  returnImages: boolean;
}

// Sources the answer's [1], [2] markers refer to. Perplexity returns them at the
// top level: `search_results` ({ title, url, ... }), or the deprecated `citations`
// (URLs only), used when there are no search results.
function sources(result: any): string[] {
  if (Array.isArray(result.search_results) && result.search_results.length > 0) {
    return result.search_results
      .filter((r: any) => r && typeof r.url === 'string')
      .map((r: any) => (r.title ? `${r.title} - ${r.url}` : r.url));
  }
  if (Array.isArray(result.citations)) {
    return result.citations.filter((url: unknown) => typeof url === 'string');
  }
  return [];
}

// Image URLs from the top-level `images` array (objects with image_url, or plain URLs)
function imageUrls(result: any): string[] {
  if (!Array.isArray(result.images)) return [];
  return result.images
    .map((image: any) => (typeof image === 'string' ? image : image?.image_url))
    .filter((url: unknown) => typeof url === 'string');
}

// Turn the API's JSON response into the tool result. Sources and images go into
// the text itself, the only part of a tool result every MCP client shows.
export function formatResponse(result: any, options: FormatOptions) {
  const answer = result?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string') {
    throw new Error('Unexpected Perplexity response: no choices[0].message.content');
  }

  let text = answer;

  const sourceList = options.returnCitations ? sources(result) : [];
  if (sourceList.length > 0) {
    text += '\n\nSources:\n' + sourceList.map((source, i) => `[${i + 1}] ${source}`).join('\n');
  }

  const images = options.returnImages ? imageUrls(result) : [];
  if (images.length > 0) {
    text += '\n\nImages:\n' + images.map((url) => `- ${url}`).join('\n');
  }

  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}
