import * as core from '@actions/core';
import { getConfig } from './config.js';
import { fetchPosts } from './fetchers/index.js';
import { applyFilters } from './filters.js';
import { transformPosts } from './transformer.js';
import {
	buildReadme,
	readReadme,
	writeReadme,
	commitReadme,
} from './output.js';

export async function runWorkflow(): Promise<void> {
	try {
		const config = getConfig();

		if (config.feedList.length === 0) {
			core.setFailed('No feed URLs provided');
			return;
		}

		core.info(`Fetching posts from ${config.feedList.length} source(s)...`);

		// Fetch posts from all sources
		let posts = await fetchPosts(config.feedList, config.userAgent);
		core.info(`Fetched ${posts.length} posts total`);

		// Apply filters
		posts = applyFilters(posts, {
			filterComments: config.filterComments,
			filterDates: config.filterDates,
			removeDuplicates: config.removeDuplicates,
		});
		core.info(`${posts.length} posts after filtering`);

		// Sort by date if enabled
		if (config.sortEnabled) {
			posts.sort((a, b) => {
				if (!a.date || !b.date) return 0;
				return config.sortOrder === 'desc'
					? b.date.getTime() - a.date.getTime()
					: a.date.getTime() - b.date.getTime();
			});
		}

		// Limit to max count
		posts = posts.slice(0, config.maxPostCount);
		core.info(`Displaying ${posts.length} posts`);

		// Transform to markdown
		const markdown = transformPosts(posts, config);

		// Update README
		const readmePaths = config.readmePath.split(',').map((p) => p.trim());

		for (const readmePath of readmePaths) {
			const previousContent = readReadme(readmePath);
			const newContent = buildReadme(
				previousContent,
				markdown,
				config.tagName,
				config.tagPostPreNewline,
			);
			writeReadme(readmePath, newContent);
			core.info(`Updated ${readmePath}`);

			// Commit changes
			if (!config.skipCommit) {
				await commitReadme(readmePath, config.ghToken);
				core.info('Committed changes');
			}
		}

		// Set output
		core.setOutput('results', JSON.stringify(posts));
	} catch (error) {
		core.setFailed(
			error instanceof Error ? error.message : 'Unknown error occurred',
		);
	}
}

// Run if executed directly
runWorkflow();
