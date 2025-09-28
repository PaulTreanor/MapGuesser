const GAME_SETUP_STEPS = {
	SELECT_MODE: 'select-mode',
	SINGLE_PLAYER: 'single-player',
	START_GAME: 'start-game',
	JOIN_GAME: 'join-game',
} as const;

type GameSetupStep = typeof GAME_SETUP_STEPS[keyof typeof GAME_SETUP_STEPS];

export { GAME_SETUP_STEPS, GameSetupStep };