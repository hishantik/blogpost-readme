import assert from 'node:assert';
import { describe, it } from 'node:test';
import { transformPosts, truncateString } from '../src/transformer.js';
import type { Post, ActionConfig } from '../src/types.js';

const defaultConfig: ActionConfig = {
	feedList: [],
	maxPostCount: 5,
	template: 'default',
	dateFormat: 'UTC:yyyy-mm-dd',
	sortEnabled: true,
	sortOrder: 'desc',
	readmePath: './README.md',
	tagName: '',
	tagPostPreNewline: false,
	filterComments: '',
	filterDates: '',
	disableHtmlEncoding: false,
	removeDuplicates: false,
	skipCommit: false,
	enableKeepalive: false,
	userAgent: 'test',
	acceptHeader: '',
	retryCount: 0,
	retryWaitTime: 0,
	ghToken: '',
};

const posts: Post[] = [
	{
		title: 'First Post',
		url: 'https://example.com/first',
		description: 'First description',
		date: new Date('2024-01-15'),
		categories: ['tech'],
		author: 'Author',
		source: 'rss',
	},
	{
		title: 'Second Post',
		url: 'https://example.com/second',
		description: 'Second description',
		date: new Date('2024-01-10'),
		categories: [],
		source: 'rss',
	},
];

describe('transformPosts', () => {
	it('should transform with default template', () => {
		const result = transformPosts(posts, defaultConfig);

		assert.ok(result.includes('[First Post](https://example.com/first)'));
		assert.ok(result.includes('[Second Post](https://example.com/second)'));
	});

	it('should transform with custom template', () => {
		const config = {
			...defaultConfig,
			template: '$counter. $title - $url',
		};

		const result = transformPosts(posts, config);

		assert.ok(result.includes('1. First Post - https://example.com/first'));
		assert.ok(result.includes('2. Second Post - https://example.com/second'));
	});

	it('should handle all template variables', () => {
		const config = {
			...defaultConfig,
			template: '$title|$url|$date|$description|$counter|$categories|$author',
		};

		const result = transformPosts([posts[0]], config);

		assert.ok(result.includes('First Post'));
		assert.ok(result.includes('https://example.com/first'));
		assert.ok(result.includes('First description'));
		assert.ok(result.includes('1'));
		assert.ok(result.includes('tech'));
		assert.ok(result.includes('Author'));
	});
});

describe('truncateString', () => {
	it('should truncate long strings', () => {
		assert.strictEqual(truncateString('Hello World', 5), 'Hello...');
	});

	it('should not truncate short strings', () => {
		assert.strictEqual(truncateString('Hi', 5), 'Hi');
	});
});
