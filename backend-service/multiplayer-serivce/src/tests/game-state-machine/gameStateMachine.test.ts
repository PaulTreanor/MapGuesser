import { describe, test, expect, beforeEach, vi } from 'vitest'
import { exportedMachine } from '../../game-state-machine/gameStateMachine'
import { GameContext } from '../../multiplayerGame.types';
const { machine, createGameContext } = exportedMachine;

// Mock the fetch function
vi.stubGlobal('fetch', vi.fn());

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

	test('startGame transition fails with zero players', async () => {
		await machine.transition('startGame', ctxNoPlayers);
		expect(ctxNoPlayers.gameStateMachinePhase).toBe('lobby');
	});


	test('startGame transition succeeds with 2 players', async () => {
		const mockLocations = [
			{ location: 'Paris', coordinates: [2.3522, 48.8566] as [number, number] },
			{ location: 'London', coordinates: [-0.1276, 51.5074] as [number, number] },
			{ location: 'Berlin', coordinates: [13.4050, 52.5200] as [number, number] },
			{ location: 'Madrid', coordinates: [-3.7038, 40.4168] as [number, number] },
			{ location: 'Rome', coordinates: [12.4964, 41.9028] as [number, number] }
		];

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: mockLocations })
		} as Response);

		await machine.transition('startGame', ctxWithPlayers);

		expect(ctxWithPlayers.gameStateMachinePhase).toBe('inRound');
		expect(ctxWithPlayers.currentRound).toBe(1);
		expect(ctxWithPlayers.rounds).toHaveLength(5);
		expect(ctxWithPlayers.rounds[0].location).toEqual(mockLocations[0]);
		expect(ctxWithPlayers.rounds[0].playerGuesses).toEqual([]);
		expect(ctxWithPlayers.rounds[0].roundEndTimeStamp).toBeUndefined();
		expect(fetch).toHaveBeenCalledWith('https://locations-service.treanorpaul9.workers.dev/locations/random?count=5');
	})

	test('startGame transition sets roundEndTimeStamp on first round when timer is set', async () => {
		const mockLocations = [
			{ location: 'Paris', coordinates: [2.3522, 48.8566] as [number, number] },
			{ location: 'London', coordinates: [-0.1276, 51.5074] as [number, number] },
			{ location: 'Berlin', coordinates: [13.4050, 52.5200] as [number, number] },
			{ location: 'Madrid', coordinates: [-3.7038, 40.4168] as [number, number] },
			{ location: 'Rome', coordinates: [12.4964, 41.9028] as [number, number] }
		];

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: mockLocations })
		} as Response);

		const startedAt = Date.now();
		const ctxWithTimer: GameContext = {
			gameOwnerId: 'host-123',
			timer: 30000,
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

		await machine.transition('startGame', ctxWithTimer);

		expect(ctxWithTimer.gameStateMachinePhase).toBe('inRound');
		expect(ctxWithTimer.rounds[0].roundEndTimeStamp).toBeGreaterThanOrEqual(startedAt + 30000);
		expect(ctxWithTimer.rounds[1].roundEndTimeStamp).toBeUndefined();
	})
})

describe('nextRound transition', () => {
	test('nextround transition fails no timer and all players have not guessed', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(1);
	});

	test('nextround transition succeeds no timer and all players have guessed', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition fails if timer has not completed and not all players have guessed', async () => {
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

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(1);
	});

	test('nextround transition succeeds if timer has not completed but all players have guessed', async () => {
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

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition succeeds if timer has completed and all players have guessed', async () => {
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

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition succeeds if timer has completed and not all players have guessed', async () => {
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

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
	});

	test('nextround transition fails if current round is last round', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		await machine.transition('nextRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});
});

describe('continueToNextRound transition', () => {
	test('continueToNextRound sets roundEndTimeStamp on the next round when timer is set', async () => {
		const startedAt = Date.now();
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			timer: 30000,
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
				},
				{
					location: { location: 'Paris', coordinates: [2.3522, 48.8566] },
					playerGuesses: [],
				},
			],
			gameStateMachinePhase: 'showRoundResult',
			currentRound: 1
		};

		await machine.transition('continueToNextRound', ctx);

		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(2);
		expect(ctx.rounds[1].roundEndTimeStamp).toBeGreaterThanOrEqual(startedAt + 30000);
	});
});

describe('roundComplete transition', () => {
	test('auto-submits timed out guesses for players who did not guess when timer expired', async () => {
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

		await machine.transition('roundComplete', ctx);

		expect(ctx.gameStateMachinePhase).toBe('showRoundResult');
		expect(ctx.rounds[0].playerGuesses).toHaveLength(2);
		expect(ctx.rounds[0].playerGuesses.find((guess) => guess.playerId === 'player-2')).toEqual({
			playerId: 'player-2',
			timedOut: true,
		});
	});

	test('does not add timed out guesses when all players have already guessed', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		await machine.transition('roundComplete', ctx);

		expect(ctx.gameStateMachinePhase).toBe('showRoundResult');
		expect(ctx.rounds[0].playerGuesses).toHaveLength(2);
	});

	test('does not auto-submit when timer is not set', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		await machine.transition('roundComplete', ctx);

		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.rounds[0].playerGuesses).toHaveLength(1);
	});
});

describe('finishFinalRound transition', () => {
	test('finishFinalRound transition fails if not final round', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 3
		};

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(3);
	});

	test('finishFinalRound transition fails no timer and all players have not guessed', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds no timer and all players have guessed', async () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [
				{ playerId: 'player-1', playerName: 'Player 1', isGuest: false },
				{ playerId: 'player-2', playerName: 'Player 2', isGuest: false }
			],
			numberOfRounds: 5,
			rounds: [
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{
					location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] },
					playerGuesses: [
						{ playerId: 'player-1', guessCoordinates: [-3.7038, 40.4168] },
						{ playerId: 'player-2', guessCoordinates: [-3.7038, 40.4168] }
					],
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 5
		};

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition fails if timer has not completed and not all players have guessed', async () => {
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

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('inRound');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has not completed but all players have guessed', async () => {
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
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
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

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has completed and all players have guessed', async () => {
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
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
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

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});

	test('finishFinalRound transition succeeds if timer has completed and not all players have guessed', async () => {
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
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
				{ location: { location: 'Madrid', coordinates: [-3.7038, 40.4168] }, playerGuesses: [] },
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

		await machine.transition('finishFinalRound', ctx);
		expect(ctx.gameStateMachinePhase).toBe('showResult');
		expect(ctx.currentRound).toBe(5);
	});
});

describe('fatalError transition', () => {
	test('fatalError transition from lobby state transitions to final', async () => {
		const ctx: GameContext = {
			gameOwnerId: 'host-123',
			players: [],
			numberOfRounds: 5,
			rounds: [],
			gameStateMachinePhase: 'lobby',
			currentRound: 0
		};

		await machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});

	test('fatalError transition from inRound state transitions to final', async () => {
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
				}
			],
			gameStateMachinePhase: 'inRound',
			currentRound: 1
		};

		await machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});

	test('fatalError transition from showResult state transitions to final', async () => {
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

		await machine.transition('fatalError', ctx);
		expect(ctx.gameStateMachinePhase).toBe('final');
	});
});