// Run with `npm test` after `npm run build`. fetch is mocked: no API key or network needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { API_URL, DEFAULT_TIMEOUT_MS, searchWeb, timeoutFromEnv } from '../dist/search.js';

const OK_BODY = JSON.stringify({ choices: [{ message: { content: 'Answer [1].' } }], citations: ['https://a.example'] });

function reply(status, body, statusText = '') {
  return { ok: status >= 200 && status < 300, status, statusText, text: async () => body };
}

// Records every call and answers with `respond(url, init)`
function mockFetch(respond) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return respond(url, init);
  };
  return { fetch, calls };
}

// Settles only when the signal aborts, rejecting the way native fetch does (with the reason)
function hangUntilAborted(signal) {
  return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
}

const deps = (fetch, extra = {}) => ({ apiKey: 'test-key', defaultModel: 'sonar', fetch, timeoutMs: 5_000, ...extra });
const text = (result) => result.content[0].text;

test('a successful call posts to the API with a timeout signal and returns no isError', async () => {
  const { fetch, calls } = mockFetch(() => reply(200, OK_BODY));
  const result = await searchWeb({ query: 'q', recency: 'week' }, deps(fetch));

  assert.equal(result.isError, undefined);
  assert.match(text(result), /Answer \[1\]\./);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, API_URL);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-key');
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  assert.equal(JSON.parse(calls[0].init.body).search_recency_filter, 'week');
});

test('an API error is a tool result with isError, the status and a hint', async () => {
  const { fetch } = mockFetch(() => reply(401, '{"error":{"message":"Invalid API key"}}', 'Unauthorized'));
  const result = await searchWeb({ query: 'q' }, deps(fetch));

  assert.equal(result.isError, true);
  assert.match(text(result), /^perplexity_search_web failed: Perplexity API error 401 Unauthorized\./);
  assert.match(text(result), /Check that PERPLEXITY_API_KEY/);
  assert.match(text(result), /Invalid API key/);
  assert.doesNotMatch(text(result), /test-key/);
});

test('rate limits and server errors get their own hints', async () => {
  for (const [status, hint] of [[429, /rate-limiting/], [503, /status\.perplexity\.ai/]]) {
    const { fetch } = mockFetch(() => reply(status, ''));
    const result = await searchWeb({ query: 'q' }, deps(fetch));
    assert.equal(result.isError, true);
    assert.match(text(result), hint);
  }
});

test('a long error body is cut short', async () => {
  const { fetch } = mockFetch(() => reply(500, '<html>' + 'x'.repeat(10_000) + '</html>'));
  const result = await searchWeb({ query: 'q' }, deps(fetch));

  assert.equal(result.isError, true);
  assert.ok(text(result).length < 1_000);
});

test('a stalled request times out as a tool error', async () => {
  const { fetch } = mockFetch((_, init) => hangUntilAborted(init.signal));
  const started = Date.now();
  const result = await searchWeb({ query: 'q' }, deps(fetch, { timeoutMs: 50 }));

  assert.ok(Date.now() - started < 2_000);
  assert.equal(result.isError, true);
  assert.match(text(result), /did not answer within 0\.05 s/);
  assert.match(text(result), /PERPLEXITY_TIMEOUT_MS/);
});

test('the timeout also covers reading the body, and node-fetch AbortErrors', async () => {
  const { fetch } = mockFetch((_, init) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    // node-fetch rejects with its own AbortError, not the signal's reason
    text: () =>
      new Promise((_, reject) =>
        init.signal.addEventListener('abort', () =>
          reject(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }))
        )
      )
  }));
  const result = await searchWeb({ query: 'q' }, deps(fetch, { timeoutMs: 50 }));

  assert.equal(result.isError, true);
  assert.match(text(result), /did not answer within/);
});

test('a network failure is a tool error', async () => {
  const { fetch } = mockFetch(() => {
    throw new TypeError('getaddrinfo ENOTFOUND api.perplexity.ai');
  });
  const result = await searchWeb({ query: 'q' }, deps(fetch));

  assert.equal(result.isError, true);
  assert.match(text(result), /could not reach the Perplexity API \(getaddrinfo ENOTFOUND/);
});

test('a body that is not JSON is a tool error', async () => {
  const { fetch } = mockFetch(() => reply(200, '<html>maintenance</html>'));
  const result = await searchWeb({ query: 'q' }, deps(fetch));

  assert.equal(result.isError, true);
  assert.match(text(result), /not JSON: <html>maintenance<\/html>/);
});

test('JSON without choices[0].message.content is a tool error', async () => {
  const { fetch } = mockFetch(() => reply(200, JSON.stringify({ choices: [] })));
  const result = await searchWeb({ query: 'q' }, deps(fetch));

  assert.equal(result.isError, true);
  assert.match(text(result), /Unexpected Perplexity response/);
});

test('bad arguments are tool errors and make no request', async () => {
  for (const args of [undefined, {}, { query: 42 }, { query: 'q', recency: 'decade' }]) {
    const { fetch, calls } = mockFetch(() => reply(200, OK_BODY));
    const result = await searchWeb(args, deps(fetch));
    assert.equal(result.isError, true, JSON.stringify(args));
    assert.equal(calls.length, 0);
  }
});

test('PERPLEXITY_TIMEOUT_MS sets the timeout; bad values give the 60 s default', () => {
  assert.equal(DEFAULT_TIMEOUT_MS, 60_000);
  assert.equal(timeoutFromEnv(undefined), 60_000);
  assert.equal(timeoutFromEnv(''), 60_000);
  assert.equal(timeoutFromEnv('15000'), 15_000);
  for (const bad of ['0', '-5', 'abc', '1.5']) assert.equal(timeoutFromEnv(bad), 60_000, bad);
});

test('with the real node-fetch, a server that never answers times out', async () => {
  const { createServer } = await import('node:http');
  const { default: nodeFetch } = await import('node-fetch');
  const sockets = new Set();
  const server = createServer(() => {}); // accepts the request, never answers
  server.on('connection', (socket) => sockets.add(socket));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const local = `http://127.0.0.1:${server.address().port}/`;
  try {
    // Same node-fetch the server uses, pointed at the local stall instead of the API
    const result = await searchWeb({ query: 'q' }, deps((_, init) => nodeFetch(local, init), { timeoutMs: 100 }));
    assert.equal(result.isError, true);
    assert.match(text(result), /did not answer within 0\.1 s/);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  }
});
