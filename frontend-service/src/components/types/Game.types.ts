type Pin = [number, number]

type Round = {
	location: string;
	coordinates: Pin;
}

interface CurrentRound {
	index: number;
	completed: boolean;
}

// object file?
const gameStatus = {
	NOT_STARTED: 'NOT_STARTED',
	IN_PROGRESS: 'IN_PROGRESS',
	FINISHED: 'FINISHED'
} as const;

type GameStatus = typeof gameStatus[keyof typeof gameStatus];

type GameState = {
	rounds: Round[] | null;
	score: number;
	status: GameStatus;
}

export { gameStatus };
export type { Round, CurrentRound, Pin, GameState };