type GameStartedMode = 'single-player' | 'multiplayer';

const GAME_STARTED_EVENT_NAME = 'Game Started';

const trackGameStarted = (mode: GameStartedMode): void => {
	window.umami?.track(GAME_STARTED_EVENT_NAME, { mode });
};

export { trackGameStarted };