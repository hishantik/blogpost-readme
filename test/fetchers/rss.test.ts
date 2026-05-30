import assert from 'node:assert';
import { describe, it } from 'node:test';
import { RssFetcher } from '../../src/fetchers/rss.js';

// Mock rss-parser
const mockParseURL = async () => ({
	items: [
		{
			title: 'Test Post 1',
			link: 'https://example.com/post-1',
			pubDate: '2024-01-15T00:00:00Z',
			contentSnippet: 'This is a test post description',
			categories: ['tech', 'javascript'],
			creator: 'Test Author',
		},
		{
			title: 'Test Post 2',
			link: 'https://example.com/post-2',
			pubDate: '2024-01-10T00:00:00Z',
			content: '<p>Another test post</p>',
		},
	],
});

describe('RssFetcher', () => {
	it('should fetch and parse RSS feed', async () => {
		const fetcher = new RssFetcher('test-agent');
		// Override parser for testing
		(fetcher as any).parser = { parseURL: mockParseURL };
		const posts = await fetcher.fetch('https://example.com/feed.xml');

		assert.strictEqual(posts.length, 2);
		assert.strictEqual(posts[0].title, 'Test Post 1');
		assert.strictEqual(posts[0].url, 'https://example.com/post-1');
		assert.strictEqual(posts[0].author, 'Test Author');
	});

	it('should handle posts without dates', async () => {
		const fetcher = new RssFetcher('test-agent');
		(fetcher as any).parser = { parseURL: mockParseURL };
		const posts = await fetcher.fetch('https://example.com/feed.xml');

		assert.ok(posts[1].date instanceof Date);
	});
});
