import * as cheerio from 'cheerio';
import type { Fetcher, Post } from '../types.js';

export class ScraperFetcher implements Fetcher {
	private userAgent: string;

	constructor(userAgent: string) {
		this.userAgent = userAgent;
	}

	async canHandle(url: string): Promise<boolean> {
		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': this.userAgent },
				signal: AbortSignal.timeout(10000),
			});
			const html = await response.text();
			const $ = cheerio.load(html);

			// Check for blog post indicators
			return !!(
				$('article').length > 0 ||
				$('[itemtype*="BlogPosting"]').length > 0 ||
				$('[itemtype*="Article"]').length > 0 ||
				$('.post, .blog-post, .article-item, .entry').length > 0
			);
		} catch {
			return false;
		}
	}

	async fetch(url: string): Promise<Post[]> {
		const response = await fetch(url, {
			headers: { 'User-Agent': this.userAgent },
			signal: AbortSignal.timeout(15000),
		});
		const html = await response.text();
		const $ = cheerio.load(html);

		const posts: Post[] = [];

		// Strategy 1: Schema.org markup
		const schemaPosts = this.extractFromSchema($);
		if (schemaPosts.length > 0) return schemaPosts;

		// Strategy 2: Article elements
		$('article').each((_, el) => {
			const post = this.extractFromElement($, $(el), url);
			if (post) posts.push(post);
		});
		if (posts.length > 0) return posts;

		// Strategy 3: Common blog classes
		const selectors = [
			'.post',
			'.blog-post',
			'.article-item',
			'.entry',
			'.blog-entry',
			'.post-item',
			'.card',
		];
		for (const selector of selectors) {
			$(selector).each((_, el) => {
				const post = this.extractFromElement($, $(el), url);
				if (post) posts.push(post);
			});
			if (posts.length > 0) return posts;
		}

		return posts;
	}

	private extractFromSchema($: cheerio.CheerioAPI, baseUrl?: string): Post[] {
		const posts: Post[] = [];

		$('[itemtype*="BlogPosting"], [itemtype*="Article"]').each((_, el) => {
			const $el = $(el);
			const title =
				$el.find('[itemprop="headline"]').text().trim() ||
				$el.find('h1, h2, h3').first().text().trim();

			const url =
				$el.find('[itemprop="url"]').attr('href') ||
				$el.find('a').first().attr('href') ||
				'';

			if (!title || !url) return;

			posts.push({
				title,
				url: this.resolveUrl(url, baseUrl || ''),
				description:
					$el.find('[itemprop="description"]').text().trim().substring(0, 300) ||
					'',
				date: this.parseDate(
					$el.find('[itemprop="datePublished"]').attr('content') ||
						$el.find('time').attr('datetime') ||
						'',
				),
				author: $el.find('[itemprop="author"]').text().trim() || undefined,
				categories: [],
				imageUrl:
					$el.find('[itemprop="image"]').attr('src') || undefined,
				source: 'scrape',
			});
		});

		return posts;
	}

	private extractFromElement(
		$: cheerio.CheerioAPI,
		$el: cheerio.Cheerio<any>,
		baseUrl: string,
	): Post | null {
		const title =
			$el.find('h1, h2, h3, h4').first().text().trim() ||
			$el.find('.title, .post-title, .entry-title').first().text().trim();

		const linkEl = $el.find('a').first();
		const href = linkEl.attr('href');

		if (!title || !href) return null;

		const description =
			$el
				.find('p, .excerpt, .summary, .description')
				.first()
				.text()
				.trim()
				.substring(0, 300) || '';

		const dateStr =
			$el.find('time').attr('datetime') ||
			$el.find('.date, .post-date, .published').first().text().trim();

		const imageUrl =
			$el.find('img').first().attr('src') || undefined;

		return {
			title,
			url: this.resolveUrl(href, baseUrl),
			description,
			date: this.parseDate(dateStr),
			author: $el.find('.author, .post-author').first().text().trim() || undefined,
			categories: [],
			imageUrl,
			source: 'scrape',
		};
	}

	private parseDate(dateStr: string): Date | null {
		if (!dateStr) return null;
		const date = new Date(dateStr);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	private resolveUrl(href: string, baseUrl: string): string {
		if (href.startsWith('http')) return href;
		try {
			return new URL(href, baseUrl).toString();
		} catch {
			return href;
		}
	}
}
