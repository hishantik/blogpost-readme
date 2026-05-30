import assert from 'node:assert';
import { describe, it } from 'node:test';
import { detectPlatform } from '../../src/fetchers/platforms.js';

describe('detectPlatform', () => {
	it('should detect dev.to URLs', () => {
		assert.strictEqual(detectPlatform('https://dev.to/hishantik'), 'devto');
		assert.strictEqual(detectPlatform('https://dev.to/feed/hishantik'), 'devto');
	});

	it('should detect hashnode URLs', () => {
		assert.strictEqual(detectPlatform('https://hashnode.com/@hishantik'), 'hashnode');
		assert.strictEqual(detectPlatform('https://hishantik.hashnode.dev'), 'hashnode');
	});

	it('should detect medium URLs', () => {
		assert.strictEqual(detectPlatform('https://medium.com/@hishantik'), 'medium');
	});

	it('should detect daily.dev URLs', () => {
		assert.strictEqual(detectPlatform('https://app.daily.dev/hishantik'), 'dailydev');
	});

	it('should return unknown for unrecognized URLs', () => {
		assert.strictEqual(detectPlatform('https://example.com/blog'), 'unknown');
	});
});
