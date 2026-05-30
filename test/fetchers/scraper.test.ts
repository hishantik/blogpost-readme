import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { ScraperFetcher } from '../../src/fetchers/scraper.js';

// Store original fetch
const originalFetch = globalThis.fetch;

function mockFetch(html: string) {
	globalThis.fetch = async () => ({
		text: async () => html,
	}) as any;
}

describe('ScraperFetcher', () => {
	beforeEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('should detect blog posts from article elements', async () => {
		mockFetch(`
			<html>
				<body>
					<article>
						<h2><a href="/post-1">Test Post</a></h2>
						<p>Description</p>
						<time datetime="2024-01-15">Jan 15</time>
					</article>
				</body>
			</html>
		`);

		const fetcher = new ScraperFetcher('test-agent');
		const canHandle = await fetcher.canHandle('https://example.com');

		assert.strictEqual(canHandle, true);
	});

	it('should extract posts from article elements', async () => {
		mockFetch(`
			<html>
				<body>
					<article>
						<h2><a href="/post-1">First Post</a></h2>
						<p>First description</p>
						<time datetime="2024-01-15">Jan 15</time>
					</article>
					<article>
						<h2><a href="/post-2">Second Post</a></h2>
						<p>Second description</p>
						<time datetime="2024-01-10">Jan 10</time>
					</article>
				</body>
			</html>
		`);

		const fetcher = new ScraperFetcher('test-agent');
		const posts = await fetcher.fetch('https://example.com');

		assert.strictEqual(posts.length, 2);
		assert.strictEqual(posts[0].title, 'First Post');
		assert.strictEqual(posts[0].source, 'scrape');
	});

	it('should return false for non-blog pages', async () => {
		mockFetch(`
			<html>
				<body>
					<div>No articles here</div>
				</body>
			</html>
		`);

		const fetcher = new ScraperFetcher('test-agent');
		const canHandle = await fetcher.canHandle('https://example.com');

		assert.strictEqual(canHandle, false);
	});
});
