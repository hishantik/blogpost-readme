import type { Fetcher, Post } from '../types.js';
import { RssFetcher } from './rss.js';
import { ScraperFetcher } from './scraper.js';

export { RssFetcher } from './rss.js';
export { ScraperFetcher } from './scraper.js';

export async function fetchPosts(
	urls: string[],
	userAgent: string,
): Promise<Post[]> {
	const rssFetcher = new RssFetcher(userAgent);
	const scraperFetcher = new ScraperFetcher(userAgent);
	const fetchers: Fetcher[] = [rssFetcher, scraperFetcher];

	const allPosts: Post[] = [];

	for (const url of urls) {
		try {
			let fetched = false;
			for (const fetcher of fetchers) {
				if (await fetcher.canHandle(url)) {
					const posts = await fetcher.fetch(url);
					allPosts.push(...posts);
					fetched = true;
					break;
				}
			}
			if (!fetched) {
				console.warn(`No fetcher could handle URL: ${url}`);
			}
		} catch (error) {
			console.error(`Error fetching ${url}:`, error);
		}
	}

	return allPosts;
}
