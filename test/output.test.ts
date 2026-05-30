import assert from 'node:assert';
import { describe, it } from 'node:test';
import { buildReadme } from '../src/output.js';

describe('buildReadme', () => {
	const readme = `# My README

Some content here.

<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

More content below.
`;

	it('should insert content between tags', () => {
		const result = buildReadme(readme, '- [Post](url)', '', false);

		assert.ok(result.includes('<!-- BLOG-POST-LIST:START -->'));
		assert.ok(result.includes('- [Post](url)'));
		assert.ok(result.includes('<!-- BLOG-POST-LIST:END -->'));
	});

	it('should use custom tag name', () => {
		const customReadme = readme.replaceAll('BLOG-POST-LIST', 'MY-TAG');
		const result = buildReadme(customReadme, '- [Post](url)', 'MY-TAG', false);

		assert.ok(result.includes('<!-- MY-TAG:START -->'));
		assert.ok(result.includes('- [Post](url)'));
		assert.ok(result.includes('<!-- MY-TAG:END -->'));
	});

	it('should add newlines when tag_post_pre_newline is true', () => {
		const result = buildReadme(readme, '- [Post](url)', '', true);

		assert.ok(result.includes('START -->\n\n- [Post](url)\n\n<!-- BLOG-POST-LIST:END'));
	});

	it('should throw if tags are missing', () => {
		const badReadme = '# No tags here';

		assert.throws(
			() => buildReadme(badReadme, 'content', '', false),
			/Could not find comment tags/,
		);
	});
});
