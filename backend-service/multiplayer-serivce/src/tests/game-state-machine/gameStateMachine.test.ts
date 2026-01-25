import { describe, test, expect, beforeEach, vi } from 'vitest'
import { exportedMachine } from '../../game-state-machine/gameStateMachine'
import { GameContext } from '../../multiplayerGame.types';
const { machine, createGameContext } = exportedMachine;

beforeEach(() => {
	vi.clearAllMocks();
});


describe('Initial Game State Machine context', () => {
	test('Creates correct context with timer', () => {
		const testGameOwnerId = 'host_123';
		const testTimerValue = 60000;
		const testNumberOfRounds = 3;
		const gameContext = createGameContext({gameOwnerId: testGameOwnerId, numberOfRounds: testNumberOfRounds, timer: testTimerValue}); 
		expect(gameContext).toEqual({
			gameOwnerId: testGameOwnerId,
			timer: testTimerValue,
			players: [],
			numberOfRounds: testNumberOfRounds,
			rounds: [],
			gameStateMachinePhase: 'lobby',
			currentRound: 0
		})
	});

	test('Creates correct context without timer', () => {
		const testGameOwnerId = 'host_123';
		const testNumberOfRounds = 3;
		const gameContext = createGameContext({gameOwnerId: testGameOwnerId, numberOfRounds: testNumberOfRounds}); 
		expect(gameContext).toEqual({
			gameOwnerId: testGameOwnerId,
			players: [],
			numberOfRounds: testNumberOfRounds,
			rounds: [],
			gameStateMachinePhase: 'lobby',
			currentRound: 0
		})
	})
});

describe('startGame transition', () => {
	const ctxNoPlayers: GameContext = {
		gameOwnerId: 'host-123',
		players: [],
		numberOfRounds: 5,
		rounds: [],
		gameStateMachinePhase: 'lobby',
		currentRound: 0
	};

	const ctxWithPlayers: GameContext = {
		gameOwnerId: 'host-123',
		players: [
			{
				playerId: 'host-123',
				playerName: 'host-123',
				isGuest: false,
			},
			{
				playerId: 'guest-123',
				playerName: 'guest-123',
				isGuest: true,
			},
		],
		numberOfRounds: 5,
		rounds: [],
		gameStateMachinePhase: 'lobby',
		currentRound: 0
	};

	test('startGame transition fails with zero players', () => {
		const gameState = machine.transition('startGame', ctxNoPlayers);
		expect(ctxNoPlayers.gameStateMachinePhase).toBe('lobby');
	});


	test('startGame transition succeeds with 2 players', () => {
		const gameState = machine.transition('startGame', ctxWithPlayers);
		expect(ctxWithPlayers.gameStateMachinePhase).toBe('inRound');
	})
})

describe('nextRound transition', () => {
	test('nextround transition fails no timer and all players have not guessed', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(1);
	});

	test('nextround transition succeeds no timer and all players have guessed', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition fails if timer has not completed and not all players have guessed', () => {
		const futureTimestamp = Date.now() + 60000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: futureTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(1);
	});

	test('nextround transition succeeds if timer has not completed but all players have guessed', () => {
		const futureTimestamp = Date.now() + 60000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: futureTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition succeeds if timer has completed and all players have guessed', () => {
		const pastTimestamp = Date.now() - 1000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: pastTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition succeeds if timer has completed and not all players have guessed', () => {
		const pastTimestamp = Date.now() - 1000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: pastTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition fails if current round is last round', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});
});

describe('finishFinalRound transition', () => {
	test('finishFinalRound transition fails if not final round', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 3
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(3);
	});

	test('finishFinalRound transition fails no timer and all players have not guessed', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds no timer and all players have guessed', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition fails if timer has not completed and not all players have guessed', () => {
		const futureTimestamp = Date.now() + 60000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: futureTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has not completed but all players have guessed', () => {
		const futureTimestamp = Date.now() + 60000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: futureTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has completed and all players have guessed', () => {
		const pastTimestamp = Date.now() - 1000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: pastTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has completed and not all players have guessed', () => {
		const pastTimestamp = Date.now() - 1000;
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 60,
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [], roundEndTimeStamp: 0 },
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] }
					],
					roundEndTimeStamp: pastTimestamp
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		const gameState = machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});
});

describe('fatalError transition', () => {
	test('fatalError transition from lobby state transitions to final', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [],
			numberOfRounds: 5,
			rounds: [],
			gameStateMachinePhase: 'lobby',
			currentRound: 0
		};

		const gameState = machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});

	test('fatalError transition from inRound state transitions to final', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [],
					roundEndTimeStamp: 0
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		const gameState = machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});

	test('fatalError transition from showResult state transitions to final', () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [],
			gameStateMachinePhase: 'showResult',
			currentRound: 5
		};

		const gameState = machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});
});