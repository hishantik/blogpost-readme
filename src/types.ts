export interface Post {
	title: string;
	url: string;
	description: string;
	date: Date | null;
	author?: string;
	categories: string[];
	imageUrl?: string;
	source: 'rss' | 'scrape';
	platform?: string;
}

export interface Fetcher {
	canHandle(url: string): Promise<boolean>;
	fetch(url: string): Promise<Post[]>;
}

export interface ActionConfig {
	feedList: string[];
	maxPostCount: number;
	template: string;
	dateFormat: string;
	sortEnabled: boolean;
	sortOrder: 'asc' | 'desc';
	readmePath: string;
	tagName: string;
	tagPostPreNewline: boolean;
	filterComments: string;
	filterDates: string;
	disableHtmlEncoding: boolean;
	removeDuplicates: boolean;
	skipCommit: boolean;
	enableKeepalive: boolean;
	userAgent: string;
	acceptHeader: string;
	retryCount: number;
	retryWaitTime: number;
	ghToken: string;
	layout: 'list' | 'table';
}
