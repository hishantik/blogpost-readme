import type { Post } from './types.js';

export function applyFilters(
	posts: Post[],
	options: {
		filterComments: string;
		filterDates: string;
		removeDuplicates: boolean;
	},
): Post[] {
	let filtered = posts;

	filtered = filterComments(filtered, options.filterComments);
	filtered = filterDates(filtered, options.filterDates);

	if (options.removeDuplicates) {
		filtered = removeDuplicates(filtered);
	}

	return filtered;
}

function filterComments(posts: Post[], filterConfig: string): Post[] {
	const filters = filterConfig.split(',').map((f) => f.trim());

	return posts.filter((post) => {
		for (const filter of filters) {
			if (filter === 'stackoverflow' && isStackOverflowComment(post)) {
				return false;
			}
			if (filter === 'stackexchange' && isStackExchangeComment(post)) {
				return false;
			}
		}
		return true;
	});
}

function isStackOverflowComment(post: Post): boolean {
	try {
		const url = new URL(post.url);
		return (
			url.hostname === 'stackoverflow.com' &&
			post.title.startsWith('Comment by ')
		);
	} catch {
		return false;
	}
}

function isStackExchangeComment(post: Post): boolean {
	try {
		const url = new URL(post.url);
		return (
			url.hostname.includes('stackexchange.com') &&
			post.title.startsWith('Comment by ')
		);
	} catch {
		return false;
	}
}

function filterDates(posts: Post[], filterConfig: string): Post[] {
	if (!filterConfig) return posts;

	const now = new Date();

	if (filterConfig.startsWith('daysAgo/')) {
		const days = Number.parseInt(filterConfig.split('/')[1], 10);
		const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
		return posts.filter(
			(post) => !post.date || post.date >= cutoff,
		);
	}

	if (filterConfig === 'currentMonth') {
		return posts.filter(
			(post) =>
				!post.date ||
				(post.date.getMonth() === now.getMonth() &&
					post.date.getFullYear() === now.getFullYear()),
		);
	}

	if (filterConfig === 'currentYear') {
		return posts.filter(
			(post) => !post.date || post.date.getFullYear() === now.getFullYear(),
		);
	}

	return posts;
}

function removeDuplicates(posts: Post[]): Post[] {
	const seen = new Set<string>();

	return posts.filter((post) => {
		const key = post.url.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
