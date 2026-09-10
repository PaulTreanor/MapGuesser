/**
 * Utilities for parsing game codes from the URL hash.
 * Handles both lobby and in-game hashes, and strips repeated prefixes
 * so a malformed hash like `#game-#game-ABC123` still resolves to `ABC123`.
 */

const GAME_HASH_PREFIX = '#game-';
const LOBBY_HASH_PREFIX = '#lobby-';
const JOIN_GAME_HASH_PREFIX = '#join-game-';
const GAME_CODE_HASH_PATTERN = /^(?:#(?:game|lobby|join-game)-)+/;

const getGameCodeFromHash = (hash: string): string => {
	return hash.replace(GAME_CODE_HASH_PATTERN, '');
};

const isLobbyHash = (hash: string): boolean => {
	return hash.startsWith(LOBBY_HASH_PREFIX);
};

const isJoinGameHash = (hash: string): boolean => {
	return hash.startsWith(JOIN_GAME_HASH_PREFIX);
};

const isGameHash = (hash: string): boolean => {
	return hash.startsWith(GAME_HASH_PREFIX);
};

export {
	getGameCodeFromHash,
	isLobbyHash,
	isGameHash,
	isJoinGameHash,
};
