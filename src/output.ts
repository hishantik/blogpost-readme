import fs from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';
import { exec } from 'node:child_process';

export function buildReadme(
	previousContent: string,
	newContent: string,
	tagName: string,
	tagPostPreNewline: boolean,
): string {
	const tagToLookFor = tagName ? `<!-- ${tagName}:` : '<!-- BLOG-POST-LIST:';
	const closingTag = '-->';

	const startOfOpeningTagIndex = previousContent.indexOf(`${tagToLookFor}START`);
	const endOfOpeningTagIndex = previousContent.indexOf(
		closingTag,
		startOfOpeningTagIndex,
	);
	const startOfClosingTagIndex = previousContent.indexOf(`${tagToLookFor}END`);

	if (
		startOfOpeningTagIndex === -1 ||
		endOfOpeningTagIndex === -1 ||
		startOfClosingTagIndex === -1
	) {
		throw new Error(
			`Could not find comment tags in README. Expected: ${tagToLookFor}START --> ... ${tagToLookFor}END -->`,
		);
	}

	const beforeTag = previousContent.substring(
		0,
		endOfOpeningTagIndex + closingTag.length,
	);
	const afterTag = previousContent.substring(startOfClosingTagIndex);

	const newline = tagPostPreNewline ? '\n' : '';

	return `${beforeTag}${newline}\n${newContent}\n${newline}${afterTag}`;
}

export function readReadme(readmePath: string): string {
	const fullPath = path.resolve(readmePath);
	if (!fs.existsSync(fullPath)) {
		throw new Error(`README file not found: ${fullPath}`);
	}
	return fs.readFileSync(fullPath, 'utf-8');
}

export function writeReadme(readmePath: string, content: string): void {
	const fullPath = path.resolve(readmePath);
	fs.writeFileSync(fullPath, content, 'utf-8');
}

export async function commitReadme(
	readmePath: string,
	ghToken: string,
): Promise<void> {
	if (!ghToken) {
		core.warning('No GitHub token provided, skipping commit');
		return;
	}

	const fullPath = path.resolve(readmePath);
	const relativePath = path.relative(process.cwd(), fullPath);

	await execCommand('git', ['add', relativePath]);
	await execCommand('git', ['commit', '-m', 'docs: update blog posts [skip-ci]']);
	await execCommand('git', ['push']);
}

function execCommand(cmd: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = exec(`${cmd} ${args.join(' ')}`, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}
