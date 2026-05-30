import dateFormat from 'dateformat';
import type { Post, ActionConfig } from './types.js';

export function transformPosts(posts: Post[], config: ActionConfig): string {
	if (config.template === 'default') {
		return transformDefault(posts, config);
	}
	return transformCustom(posts, config);
}

function transformDefault(posts: Post[], config: ActionConfig): string {
	return posts
		.map((post) => {
			const date = post.date
				? ` - ${dateFormat(post.date, config.dateFormat)}`
				: '';
			return `- [${post.title}](${post.url})${date}`;
		})
		.join('\n');
}

function transformCustom(posts: Post[], config: ActionConfig): string {
	return posts
		.map((post, index) => {
			let result = config.template;

			result = result.replace(/\$title/g, escapeHtml(post.title, config));
			result = result.replace(/\$url/g, post.url);
			result = result.replace(
				/\$date/g,
				post.date ? dateFormat(post.date, config.dateFormat) : '',
			);
			result = result.replace(
				/\$description/g,
				escapeHtml(post.description, config),
			);
			result = result.replace(/\$counter/g, String(index + 1));
			result = result.replace(/\$categories/g, post.categories.join(', '));
			result = result.replace(/\$author/g, post.author || '');
			result = result.replace(/\$imageUrl/g, post.imageUrl || '');
			result = result.replace(/\$newline/g, '\n');

			return result;
		})
		.join('\n');
}

function escapeHtml(str: string, config: ActionConfig): string {
	if (config.disableHtmlEncoding) return str;

	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function truncateString(str: string, maxLength: number): string {
	if (!maxLength || str.length <= maxLength) return str;
	return `${str.substring(0, maxLength)}...`;
}
