import dateFormat from 'dateformat';
import type { Post, ActionConfig } from './types.js';

export function transformPosts(posts: Post[], config: ActionConfig): string {
	if (config.layout === 'table') {
		if (config.template !== 'default') {
			return transformTableWithTemplate(posts, config);
		}
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
			? truncateString(sanitizeForTable(escapeHtml(post.description, config)), 80)
			: '-';

		return `| ${num} | ${title} | ${date} | ${platform} | ${author} | ${description} |`;
	});

	const header = '| # | Title | Date | Platform | Author | Description |';
	const separator = '|---|-------|------|----------|--------|-------------|';

	return [header, separator, ...rows].join('\n');
}

function transformTableWithTemplate(posts: Post[], config: ActionConfig): string {
	const cells = config.template.split('|').map((s) => s.trim());
	const headerVars = cells.filter((cell) => /^\$[a-zA-Z]+$/.test(cell));
	const headers = headerVars.map((v) => {
		const name = v.substring(1);
		return name.charAt(0).toUpperCase() + name.slice(1);
	});

	const applyTemplate = (post: Post, index: number): string => {
		let result = config.template;
		result = result.replace(/\$title/g, sanitizeForTable(escapeHtml(post.title, config)));
		result = result.replace(/\$url/g, post.url);
		result = result.replace(
			/\$date/g,
			post.date ? dateFormat(post.date, config.dateFormat) : '',
		);
		result = result.replace(
			/\$description/g,
			sanitizeForTable(escapeHtml(post.description, config)),
		);
		result = result.replace(/\$counter/g, String(index + 1));
		result = result.replace(/\$categories/g, sanitizeForTable(post.categories.join(', ')));
		result = result.replace(/\$author/g, sanitizeForTable(post.author || ''));
		result = result.replace(/\$imageUrl/g, post.imageUrl || '');
		result = result.replace(
			/\$platform/g,
			post.platform ? formatPlatform(post.platform) : '',
		);
		result = result.replace(/\$newline/g, '\n');
		return result;
	};

	const rows = posts.map((post, index) => {
		const cell = applyTemplate(post, index);
		if (cell.includes('|')) {
			return cell.startsWith('|') ? cell : `| ${cell}`;
		}
		return `| ${cell} |`;
	});

	const headerRow = `| ${headers.join(' | ')} |`;
	const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;

	return [headerRow, separatorRow, ...rows].join('\n');
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

function sanitizeForTable(str: string): string {
	return str
		.replace(/\n/g, ' ')
		.replace(/\r/g, '')
		.replace(/\|/g, '\\|')
		.replace(/\s+/g, ' ')
		.trim();
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
