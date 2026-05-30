import * as core from '@actions/core';
import type { ActionConfig } from './types.js';

export function getConfig(): ActionConfig {
	return {
		feedList: core
			.getInput('feed_list')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
		maxPostCount: Number.parseInt(core.getInput('max_post_count') || '5', 10),
		template: core.getInput('template') || 'default',
		dateFormat:
			core.getInput('date_format') || 'UTC:ddd mmm dd yyyy h:MM TT',
		sortEnabled: core.getInput('disable_sort') !== 'true',
		sortOrder: (core.getInput('sort_order') || 'desc') as 'asc' | 'desc',
		readmePath: core.getInput('readme_path') || './README.md',
		tagName: core.getInput('comment_tag_name') || '',
		tagPostPreNewline: core.getInput('tag_post_pre_newline') === 'true',
		filterComments:
			core.getInput('filter_comments') ||
			'stackoverflow/Comment by $author/,stackexchange/Comment by $author/',
		filterDates: core.getInput('filter_dates') || '',
		disableHtmlEncoding: core.getInput('disable_html_encoding') === 'true',
		removeDuplicates: core.getInput('remove_duplicates') === 'true',
		skipCommit: core.getInput('skip_commit') === 'true',
		enableKeepalive: core.getInput('enable_keepalive') !== 'false',
		userAgent: core.getInput('user_agent') || 'blogpost-readme-enhanced',
		acceptHeader:
			core.getInput('accept_header') ||
			'application/rss+xml, application/xml, text/xml',
		retryCount: Number.parseInt(core.getInput('retry_count') || '0', 10),
		retryWaitTime: Number.parseInt(core.getInput('retry_wait_time') || '1', 10),
		ghToken: core.getInput('gh_token') || '',
	};
}
