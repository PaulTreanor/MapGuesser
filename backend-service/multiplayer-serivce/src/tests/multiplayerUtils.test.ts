import { describe, test, expect, vi } from 'vitest';
import { MAX_GAME_CODE_ATTEMPTS, generateGameCode, insertGameCodeWithRetry } from '../multiplayerUtils';

const createMockDb = (runMock: ReturnType<typeof vi.fn>): D1Database => ({
	prepare: vi.fn(() => ({
		bind: vi.fn(() => ({
			run: runMock
		}))
	})),
} as unknown as D1Database);

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

describe('insertGameCodeWithRetry', () => {
	test('should insert a game code and return it when no collision occurs', async () => {
		const runMock = vi.fn().mockResolvedValue({ success: true });
		const db = createMockDb(runMock);

		const gameCode = await insertGameCodeWithRetry(db, 1234567890);

		expect(gameCode).toHaveLength(6);
		expect(runMock).toHaveBeenCalledTimes(1);
	});

	test('should regenerate the code on a unique constraint collision and succeed', async () => {
		const runMock = vi.fn()
			.mockRejectedValueOnce(new Error('UNIQUE constraint failed: games.game_code'))
			.mockResolvedValueOnce({ success: true });
		const db = createMockDb(runMock);

		const gameCode = await insertGameCodeWithRetry(db, 1234567890);

		expect(gameCode).toHaveLength(6);
		expect(runMock).toHaveBeenCalledTimes(2);
	});

	test('should throw after exhausting all attempts on repeated collisions', async () => {
		const runMock = vi.fn().mockRejectedValue(new Error('UNIQUE constraint failed: games.game_code'));
		const db = createMockDb(runMock);

		await expect(insertGameCodeWithRetry(db, 1234567890)).rejects.toThrow(
			'Failed to generate a unique game code'
		);
		expect(runMock).toHaveBeenCalledTimes(MAX_GAME_CODE_ATTEMPTS);
	});

	test('should rethrow non-constraint errors immediately without retrying', async () => {
		const runMock = vi.fn().mockRejectedValue(new Error('D1 database is down'));
		const db = createMockDb(runMock);

		await expect(insertGameCodeWithRetry(db, 1234567890)).rejects.toThrow('D1 database is down');
		expect(runMock).toHaveBeenCalledTimes(1);
	});
});
