type Pin = [number, number];

type Location = {
	location: string;
	coordinates: Pin
};

type PlayerGuess = {
	playerId: string;
	guessCoordinates: Pin;
};

type Round = {
	location: Location;
	playerGuesses: PlayerGuess[];
	roundEndTimeStamp?: number;
}

type GameState = "lobby" | "inRound" | "showRoundResult" | "showResult" | "final";

type Event = "startGame" | "roundComplete" | "continueToNextRound" | "finishFinalRound" | "gameEnded" | "fatalError";

interface Player {
	playerId: string;
	playerName: string;
	isGuest: boolean;
};

interface GameContext {
	gameOwnerId: string;
	timer?: number;
	players: Player[];
	numberOfRounds: number;
	rounds: Round[];
	gameStateMachinePhase: GameState;
	currentRound: number;
};

type TransitionConfig = {
	target: GameState;
	guard?: (ctx: GameContext, event: Event) => boolean;
	action: (ctx: GameContext, event: Event) => void | Promise<void>;
};

type StateConfig = {
	actions: {
		onEnter: (ctx: GameContext, event: Event) => void;
		onExit: (ctx: GameContext, event: Event) => void;
	};
	transitions: Partial<Record<Event, TransitionConfig>>;
};

type StateMachineDefinition = {
	initialState: GameState;
} & Record<GameState, StateConfig>;

export {
	type GameState,
	type Event,
	type GameContext,
	type TransitionConfig,
	type StateConfig,
	type StateMachineDefinition,
}