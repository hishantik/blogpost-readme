import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import type { Fetcher, Post } from '../types.js';

export type Platform = 'devto' | 'hashnode' | 'medium' | 'dailydev' | 'unknown';

export function detectPlatform(url: string): Platform {
	const lower = url.toLowerCase();
	if (lower.includes('dev.to')) return 'devto';
	if (lower.includes('hashnode')) return 'hashnode';
	if (lower.includes('medium.com')) return 'medium';
	if (lower.includes('daily.dev')) return 'dailydev';
	return 'unknown';
}

function extractUsername(url: string, platform: Platform): string | null {
	try {
		const parsed = new URL(url);
		const parts = parsed.pathname.split('/').filter(Boolean);
		if (platform === 'devto' && parts.length >= 1) return parts[0];
		if (platform === 'hashnode' && parts[0]?.startsWith('@')) return parts[0].slice(1);
		if (platform === 'hashnode' && parts.length >= 1) return parts[0];
		if (platform === 'medium' && parts[0]?.startsWith('@')) return parts[0].slice(1);
		if (platform === 'dailydev' && parts.length >= 1) return parts[0];
		return null;
	} catch {
		return null;
	}
}

function getRssUrl(platform: Platform, username: string): string | null {
	switch (platform) {
		case 'devto':
			return `https://dev.to/feed/${username}`;
		case 'hashnode':
			return `https://hashnode.com/@${username}/rss`;
		case 'medium':
			return `https://medium.com/feed/@${username}`;
		default:
			return null;
	}
}

export class PlatformFetcher implements Fetcher {
	private parser: Parser;
	private userAgent: string;

	constructor(userAgent: string) {
		this.userAgent = userAgent;
		this.parser = new Parser({
			headers: { 'User-Agent': userAgent },
			timeout: 10000,
		});
	}

	async canHandle(url: string): Promise<boolean> {
		const platform = detectPlatform(url);
		if (platform === 'unknown') return false;

		// For RSS-based platforms, try to parse the feed
		if (platform !== 'dailydev') {
			const username = extractUsername(url, platform);
			if (!username) return false;
			const rssUrl = getRssUrl(platform, username);
			if (!rssUrl) return false;
			try {
				const feed = await this.parser.parseURL(rssUrl);
				return !!(feed.items && feed.items.length > 0);
			} catch {
				return false;
			}
		}

		// daily.dev: check if profile page exists
		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': this.userAgent },
				signal: AbortSignal.timeout(10000),
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async fetch(url: string): Promise<Post[]> {
		const platform = detectPlatform(url);
		const username = extractUsername(url, platform);

		if (platform === 'dailydev') {
			return this.fetchDailyDev(url);
		}

		if (!username) return [];

		const rssUrl = getRssUrl(platform, username);
		if (!rssUrl) return [];

		try {
			const feed = await this.parser.parseURL(rssUrl);
			return feed.items.map((item) => ({
				title: item.title || 'Untitled',
				url: item.link || item.guid || '',
				description: this.extractDescription(item),
				date: item.pubDate ? new Date(item.pubDate) : null,
				author: item.creator || item.author || username,
				categories: this.extractCategories(item),
				imageUrl: this.extractImage(item),
				source: 'rss' as const,
				platform,
			}));
		} catch (error) {
			console.error(`Failed to fetch ${platform} RSS for ${username}:`, error);
			return [];
		}
	}

	private async fetchDailyDev(url: string): Promise<Post[]> {
		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': this.userAgent },
				signal: AbortSignal.timeout(15000),
			});
			const html = await response.text();
			const $ = cheerio.load(html);

			const posts: Post[] = [];

			// daily.dev uses JSON-LD or structured data
			$('script[type="application/ld+json"]').each((_, el) => {
				try {
					const data = JSON.parse($(el).html() || '');
					if (data['@type'] === 'BlogPosting' || data['@type'] === 'Article') {
						posts.push({
							title: data.headline || data.name || 'Untitled',
							url: data.url || url,
							description: data.description || '',
							date: data.datePublished ? new Date(data.datePublished) : null,
							author: data.author?.name || undefined,
							categories: [],
							imageUrl: data.image || undefined,
							source: 'scrape' as const,
							platform: 'dailydev',
						});
					}
				} catch {}
			});

			// Fallback: scrape article cards
			if (posts.length === 0) {
				$('article, [data-testid="post-card"], .post-card').each((_, el) => {
					const $el = $(el);
					const title = $el.find('h2, h3, h4, .post-title').first().text().trim();
					const href = $el.find('a').first().attr('href') || $el.attr('href');
					if (!title || !href) return;

					posts.push({
						title,
						url: href.startsWith('http') ? href : `https://app.daily.dev${href}`,
						description: $el.find('p, .post-description').first().text().trim().substring(0, 300),
						date: null,
						author: $el.find('.author-name, .username').first().text().trim() || undefined,
						categories: [],
						imageUrl: $el.find('img').first().attr('src') || undefined,
						source: 'scrape' as const,
						platform: 'dailydev',
					});
				});
			}

			return posts;
		} catch (error) {
			console.error('Failed to fetch daily.dev:', error);
			return [];
		}
	}

	private extractDescription(item: any): string {
		if (item.contentSnippet) return item.contentSnippet.substring(0, 300);
		if (item.content) return item.content.replace(/<[^>]*>/g, '').substring(0, 300);
		if (item.description) return item.description.replace(/<[^>]*>/g, '').substring(0, 300);
		return '';
	}

	private extractCategories(item: any): string[] {
		if (!item.categories) return [];
		if (Array.isArray(item.categories)) {
			return item.categories.map((c: any) =>
				typeof c === 'string' ? c : c._ || c.name || String(c),
			);
		}
		return [];
	}

	private extractImage(item: any): string | undefined {
		if (item['media:content']?.$?.url) return item['media:content'].$.url;
		if (item.enclosure?.url) return item.enclosure.url;
		if (item.content) {
			const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
			if (imgMatch) return imgMatch[1];
		}
		return undefined;
	}
}
