const MAX_GAME_CODE_ATTEMPTS = 5;

const generateGameCode = (): string => {
	const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
	return gameCode;
};

const isUniqueConstraintError = (error: unknown): boolean =>
	error instanceof Error && error.message.includes('UNIQUE constraint');

const insertGameCodeWithRetry = async (
	db: D1Database,
	createdAt: number
): Promise<string> => {
	for (let attempt = 0; attempt < MAX_GAME_CODE_ATTEMPTS; attempt++) {
		const gameCode = generateGameCode();
		try {
			await db.prepare(
				'INSERT INTO games (game_code, created_at) VALUES (?, ?)'
			).bind(gameCode, createdAt).run();
			return gameCode;
		} catch (error) {
			if (!isUniqueConstraintError(error)) {
				throw error;
			}
		}
	}

	throw new Error('Failed to generate a unique game code');
};

export {
	MAX_GAME_CODE_ATTEMPTS,
	generateGameCode,
	insertGameCodeWithRetry
};
