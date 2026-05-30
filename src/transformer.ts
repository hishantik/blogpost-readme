import dateFormat from 'dateformat';
import type { Post, ActionConfig } from './types.js';

export function transformPosts(posts: Post[], config: ActionConfig): string {
	if (config.layout === 'table') {
		return transformTable(posts, config);
	}
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
			const platform = post.platform ? ` (${formatPlatform(post.platform)})` : '';
			return `- [${post.title}](${post.url})${date}${platform}`;
		})
		.join('\n');
}

function transformTable(posts: Post[], config: ActionConfig): string {
	const rows = posts.map((post, index) => {
		const num = String(index + 1);
		const title = `[${escapeHtml(post.title, config)}](${post.url})`;
		const date = post.date ? dateFormat(post.date, config.dateFormat) : '-';
		const platform = post.platform ? formatPlatform(post.platform) : '-';
		const author = post.author || '-';
		const description = post.description
			? truncateString(escapeHtml(post.description, config), 80)
			: '-';

		return `| ${num} | ${title} | ${date} | ${platform} | ${author} | ${description} |`;
	});

	const header = '| # | Title | Date | Platform | Author | Description |';
	const separator = '|---|-------|------|----------|--------|-------------|';

	return [header, separator, ...rows].join('\n');
}

function formatPlatform(platform: string): string {
	const names: Record<string, string> = {
		devto: 'dev.to',
		hashnode: 'Hashnode',
		medium: 'Medium',
		dailydev: 'daily.dev',
	};
	return names[platform] || platform;
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
			result = result.replace(/\$platform/g, post.platform ? formatPlatform(post.platform) : '');
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
