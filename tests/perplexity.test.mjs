// Run with `npm test` after `npm run build`. No API key or network needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { buildRequest, formatResponse } from '../dist/perplexity.js';

const both = { returnCitations: true, returnImages: true };
const answer = (extra = {}) => ({ choices: [{ message: { content: 'Answer [1].' } }], ...extra });

test('buildRequest sends no recency filter or prompt hint by default', () => {
  const body = buildRequest({ query: 'q' }, 'sonar');
  assert.equal(body.model, 'sonar');
  assert.equal('search_recency_filter' in body, false);
  assert.doesNotMatch(body.messages[0].content, /Focus on results/);
  assert.deepEqual(body.messages[1], { role: 'user', content: 'q' });
});

test('buildRequest maps recency to search_recency_filter', () => {
  const body = buildRequest({ query: 'q', recency: 'week' }, 'sonar');
  assert.equal(body.search_recency_filter, 'week');
  assert.doesNotMatch(JSON.stringify(body.messages), /week/);
});

test('buildRequest rejects an unknown recency', () => {
  assert.throws(() => buildRequest({ query: 'q', recency: 'decade' }, 'sonar'), /recency must be one of/);
});

test('buildRequest never forwards stream or return_citations', () => {
  const body = buildRequest({ query: 'q', stream: true, return_citations: true }, 'sonar');
  assert.equal('stream' in body, false);
  assert.equal('return_citations' in body, false);
});

test('buildRequest passes optional parameters through only when given', () => {
  const body = buildRequest({ query: 'q', model: 'sonar-pro', temperature: 0, top_k: 0 }, 'sonar');
  assert.equal(body.model, 'sonar-pro');
  assert.equal(body.temperature, 0);
  assert.equal(body.top_k, 0);
  assert.equal('max_tokens' in body, false);
  assert.equal('top_p' in body, false);
});

test('formatResponse lists search_results with titles as Sources', () => {
  const result = formatResponse(
    answer({
      search_results: [{ title: 'A', url: 'https://a.example' }, { url: 'https://b.example' }],
      citations: ['https://ignored.example']
    }),
    both
  );
  assert.deepEqual(result, {
    content: [{ type: 'text', text: 'Answer [1].\n\nSources:\n[1] A - https://a.example\n[2] https://b.example' }]
  });
});

test('formatResponse falls back to the deprecated citations', () => {
  for (const extra of [{}, { search_results: [] }]) {
    const { content } = formatResponse(
      answer({ ...extra, citations: ['https://a.example', 'https://b.example'] }),
      both
    );
    assert.equal(content[0].text, 'Answer [1].\n\nSources:\n[1] https://a.example\n[2] https://b.example');
  }
});

test('formatResponse appends image URLs only when requested', () => {
  const result = answer({ images: [{ image_url: 'https://i.example/1.png' }, 'https://i.example/2.png'] });
  assert.equal(
    formatResponse(result, both).content[0].text,
    'Answer [1].\n\nImages:\n- https://i.example/1.png\n- https://i.example/2.png'
  );
  assert.equal(formatResponse(result, { returnCitations: true, returnImages: false }).content[0].text, 'Answer [1].');
});

test('formatResponse leaves sources out when return_citations is false', () => {
  const result = answer({ citations: ['https://a.example'] });
  assert.equal(formatResponse(result, { returnCitations: false, returnImages: false }).content[0].text, 'Answer [1].');
});

test('formatResponse ignores citations nested in the message and adds no meta key', () => {
  const result = formatResponse({ choices: [{ message: { content: 'x', citations: ['https://n.example'] } }] }, both);
  assert.deepEqual(Object.keys(result), ['content']);
  assert.equal(result.content[0].text, 'x');
});

test('formatResponse reports a response without content', () => {
  assert.throws(() => formatResponse({ choices: [] }, both), /Unexpected Perplexity response/);
});

test('server lists the tool without stream or a recency default', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../dist/index.js', import.meta.url))],
    env: { PATH: process.env.PATH ?? '', PERPLEXITY_API_KEY: 'test-key-not-used' }
  });
  const client = new Client({ name: 'test', version: '0.0.0' });
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name), ['perplexity_search_web']);
    const { properties } = tools[0].inputSchema;
    assert.equal('stream' in properties, false);
    assert.equal('default' in properties.recency, false);
    assert.deepEqual(properties.recency.enum, ['hour', 'day', 'week', 'month', 'year']);
  } finally {
    await client.close();
  }
});
