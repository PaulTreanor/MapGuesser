import { gameStatus } from '../../objects/gameStatuses';

type Pin = [number, number]

type Round = {
	location: string;
	coordinates: Pin;
}

interface CurrentRound {
	index: number;
	completed: boolean;
}

type GameStatus = typeof gameStatus[keyof typeof gameStatus];

type GameState = {
	rounds: Round[] | null;
	score: number;
	status: GameStatus;
}

export type { Round, CurrentRound, Pin, GameState, GameStatus };