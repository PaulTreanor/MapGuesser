import type { Pin } from './Game.types';

type CreateGameResponse = {
	gameCode: string;
	timer: number;
	gameOwnerId: string;
};

type JoinGameResponse = {
	roomId: string;
	status: string;
	expiresAt: string;
	wsUrl: string;
	gameOwnerId: string;
};

type Player = {
	playerId: string;
	playerName: string;
	isGuest: boolean;
};

type Location = {
	location: string;
	coordinates: Pin;
};

type PlayerGuess = {
	playerId: string;
	guessCoordinates: Pin;
};

type MultiplayerRound = {
	location: Location;
	playerGuesses: PlayerGuess[];
	roundEndTimeStamp?: number;
};

type GamePhase = "lobby" | "inRound" | "showRoundResult" | "showResult" | "final";

type GameContext = {
	gameOwnerId: string;
	timer?: number;
	players: Player[];
	numberOfRounds: number;
	rounds: MultiplayerRound[];
	gameStateMachinePhase: GamePhase;
	currentRound: number;
};

type GameRoomMessage = {
	type: string;
	[key: string]: unknown;
};

export type {
	CreateGameResponse,
	JoinGameResponse,
	Player,
	GameRoomMessage,
	GameContext,
	GamePhase,
	MultiplayerRound,
	Location,
	PlayerGuess,
}