// The perplexity_search_web call: validate the arguments, call the Perplexity API with a
// timeout, and turn every failure into a tool result with `isError: true`, so the
// calling model sees what went wrong and can recover. `fetch` is passed in, so tests
// can mock it.
import { buildRequest, formatResponse, SearchArgs } from './perplexity.js';

export const API_URL = 'https://api.perplexity.ai/chat/completions';
export const DEFAULT_TIMEOUT_MS = 60_000;

// Longest part of an API error body that goes into the error text
const MAX_ERROR_BODY_CHARS = 500;

export interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }
) => Promise<FetchResponse>;

export interface SearchDeps {
  apiKey: string;
  defaultModel: string;
  fetch: FetchLike;
  timeoutMs: number;
}

export interface ToolResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

// PERPLEXITY_TIMEOUT_MS: a whole number of milliseconds > 0; anything else gives the default
export function timeoutFromEnv(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return DEFAULT_TIMEOUT_MS;
  const ms = Number(value);
  return Number.isInteger(ms) && ms > 0 ? ms : DEFAULT_TIMEOUT_MS;
}

export function toolError(message: string): ToolResult {
  return { isError: true, content: [{ type: 'text', text: `perplexity_search_web failed: ${message}` }] };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// We abort only through the timeout signal. Native fetch rejects with the signal's
// reason (a TimeoutError); node-fetch rejects with its own AbortError.
function isTimeout(error: unknown): boolean {
  const name = (error as { name?: unknown } | null)?.name;
  return name === 'TimeoutError' || name === 'AbortError';
}

function timeoutError(timeoutMs: number): ToolResult {
  return toolError(
    `Perplexity did not answer within ${timeoutMs / 1000} s. Try again, or ask a narrower question. ` +
      'The limit is set with the PERPLEXITY_TIMEOUT_MS environment variable (default 60000).'
  );
}

function statusHint(status: number): string {
  if (status === 401 || status === 403) return ' Check that PERPLEXITY_API_KEY is a valid Perplexity API key.';
  if (status === 429) return ' Perplexity is rate-limiting this key; wait and try again.';
  if (status >= 500) return ' Perplexity had a server error; try again later or see https://status.perplexity.ai/.';
  return '';
}

function truncate(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > limit ? `${flat.slice(0, limit)}...` : flat;
}

export async function searchWeb(rawArgs: unknown, deps: SearchDeps): Promise<ToolResult> {
  const args = rawArgs as SearchArgs | undefined;
  if (!args || typeof args !== 'object' || typeof args.query !== 'string') {
    return toolError('"query" is required and must be a string.');
  }

  let apiRequest: Record<string, any>;
  try {
    apiRequest = buildRequest(args, deps.defaultModel);
  } catch (error) {
    return toolError(errorMessage(error));
  }

  // One signal covers the request and reading the body
  const signal = AbortSignal.timeout(deps.timeoutMs);
  let response: FetchResponse;
  let body: string;
  try {
    response = await deps.fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deps.apiKey}`,
        'X-Pplx-Integration': 'perplexity-mcp'
      },
      body: JSON.stringify(apiRequest),
      signal
    });
    body = await response.text();
  } catch (error) {
    if (isTimeout(error) || signal.aborted) return timeoutError(deps.timeoutMs);
    return toolError(
      `could not reach the Perplexity API (${errorMessage(error)}). ` +
        'Check the network connection and https://status.perplexity.ai/.'
    );
  }

  if (!response.ok) {
    const detail = truncate(body, MAX_ERROR_BODY_CHARS);
    return toolError(
      `Perplexity API error ${response.status} ${response.statusText}.${statusHint(response.status)}` +
        (detail ? ` Response: ${detail}` : '')
    );
  }

  let result: unknown;
  try {
    result = JSON.parse(body);
  } catch {
    return toolError(
      `Perplexity returned a response that is not JSON: ${truncate(body, MAX_ERROR_BODY_CHARS) || '(empty)'}`
    );
  }

  try {
    return formatResponse(result, {
      returnCitations: args.return_citations !== false,
      returnImages: args.return_images === true
    });
  } catch (error) {
    return toolError(errorMessage(error));
  }
}
