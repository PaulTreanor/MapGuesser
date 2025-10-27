import { describe, test, expect } from 'vitest';
import { generateGameCode } from '../multiplayerUtils';

describe('generateGameCode', () => {
	test('should return a 6-character string', () => {
		const gameCode = generateGameCode();
		expect(gameCode).toHaveLength(6);
	});

	test('should return an uppercase string', () => {
		const gameCode = generateGameCode();
		expect(gameCode).toMatch(/^[A-Z0-9]+$/);
	});
});
