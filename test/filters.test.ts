import assert from 'node:assert';
import { describe, it } from 'node:test';
import { applyFilters } from '../src/filters.js';
import type { Post } from '../src/types.js';

const createPost = (overrides: Partial<Post> = {}): Post => ({
	title: 'Test Post',
	url: 'https://example.com/post',
	description: 'Test description',
	date: new Date('2024-01-15'),
	categories: [],
	source: 'rss',
	...overrides,
});

describe('applyFilters', () => {
	it('should filter StackOverflow comments', () => {
		const posts = [
			createPost({ title: 'Comment by user' }),
			createPost({
				title: 'Actual Post',
				url: 'https://stackoverflow.com/questions/123',
			}),
		];

		const result = applyFilters(posts, {
			filterComments: 'stackoverflow',
			filterDates: '',
			removeDuplicates: false,
		});

		assert.strictEqual(result.length, 2);
	});

	it('should filter by date range', () => {
		const now = new Date();
		const oldDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
		const recentDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

		const posts = [
			createPost({ title: 'Old Post', date: oldDate }),
			createPost({ title: 'Recent Post', date: recentDate }),
		];

		const result = applyFilters(posts, {
			filterComments: '',
			filterDates: 'daysAgo/30',
			removeDuplicates: false,
		});

		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].title, 'Recent Post');
	});

	it('should remove duplicates', () => {
		const posts = [
			createPost({ url: 'https://example.com/post-1' }),
			createPost({ url: 'https://example.com/post-1' }),
			createPost({ url: 'https://example.com/post-2' }),
		];

		const result = applyFilters(posts, {
			filterComments: '',
			filterDates: '',
			removeDuplicates: true,
		});

		assert.strictEqual(result.length, 2);
	});
});
