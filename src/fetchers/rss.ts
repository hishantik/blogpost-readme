import Parser from 'rss-parser';
import type { Fetcher, Post } from '../types.js';

export class RssFetcher implements Fetcher {
	private parser: Parser;

	constructor(userAgent: string) {
		this.parser = new Parser({
			headers: {
				'User-Agent': userAgent,
			},
			timeout: 10000,
		});
	}

	async canHandle(url: string): Promise<boolean> {
		try {
			const feed = await this.parser.parseURL(url);
			return !!(feed.items && feed.items.length > 0);
		} catch {
			return false;
		}
	}

	async fetch(url: string): Promise<Post[]> {
		const feed = await this.parser.parseURL(url);

		return feed.items.map((item) => {
			const categories = this.extractCategories(item);
			const imageUrl = this.extractImage(item);

			return {
				title: item.title || 'Untitled',
				url: item.link || item.guid || '',
				description: this.extractDescription(item),
				date: item.pubDate ? new Date(item.pubDate) : null,
				author: item.creator || item.author || undefined,
				categories,
				imageUrl,
				source: 'rss' as const,
			};
		});
	}

	private extractDescription(item: any): string {
		if (item.contentSnippet) {
			return item.contentSnippet.substring(0, 300);
		}
		if (item.content) {
			// Strip HTML tags
			return item.content
				.replace(/<[^>]*>/g, '')
				.substring(0, 300);
		}
		if (item.description) {
			return item.description
				.replace(/<[^>]*>/g, '')
				.substring(0, 300);
		}
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
		// Check media:content
		if (item['media:content']?.$?.url) {
			return item['media:content'].$.url;
		}
		// Check enclosure
		if (item.enclosure?.url) {
			return item.enclosure.url;
		}
		// Check for image in content
		if (item.content) {
			const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
			if (imgMatch) return imgMatch[1];
		}
		return undefined;
	}
}
