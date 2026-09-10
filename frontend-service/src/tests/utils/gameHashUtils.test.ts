import { describe, test, expect } from 'vitest';
import { getGameCodeFromHash, isLobbyHash, isGameHash, isJoinGameHash } from '../../utils/gameHashUtils';

describe('gameHashUtils', () => {
	describe('getGameCodeFromHash', () => {
		test('extracts code from game hash', () => {
			expect(getGameCodeFromHash('#game-ABC123')).toBe('ABC123');
		});

		test('extracts code from lobby hash', () => {
			expect(getGameCodeFromHash('#lobby-ABC123')).toBe('ABC123');
		});

		test('extracts code from join game hash', () => {
			expect(getGameCodeFromHash('#join-game-ABC123')).toBe('ABC123');
		});

		test('strips repeated game prefixes from malformed hash', () => {
			expect(getGameCodeFromHash('#game-#game-ABC123')).toBe('ABC123');
		});

		test('strips mixed repeated prefixes from malformed hash', () => {
			expect(getGameCodeFromHash('#lobby-#game-ABC123')).toBe('ABC123');
		});

		test('returns empty string for empty hash', () => {
			expect(getGameCodeFromHash('')).toBe('');
		});

		test('returns hash unchanged when no game prefix present', () => {
			expect(getGameCodeFromHash('#single-player')).toBe('#single-player');
		});

		test('returns join-game hash unchanged when no code present', () => {
			expect(getGameCodeFromHash('#join-game')).toBe('#join-game');
		});
	});

	describe('isLobbyHash', () => {
		test('returns true for lobby hash', () => {
			expect(isLobbyHash('#lobby-ABC123')).toBe(true);
		});

		test('returns false for game hash', () => {
			expect(isLobbyHash('#game-ABC123')).toBe(false);
		});
	});

	describe('isGameHash', () => {
		test('returns true for game hash', () => {
			expect(isGameHash('#game-ABC123')).toBe(true);
		});

		test('returns false for lobby hash', () => {
			expect(isGameHash('#lobby-ABC123')).toBe(false);
		});
	});

	describe('isJoinGameHash', () => {
		test('returns true for join game hash', () => {
			expect(isJoinGameHash('#join-game-ABC123')).toBe(true);
		});

		test('returns false for lobby hash', () => {
			expect(isJoinGameHash('#lobby-ABC123')).toBe(false);
		});

		test('returns false for plain join game hash without code', () => {
			expect(isJoinGameHash('#join-game')).toBe(false);
		});
	});
});
