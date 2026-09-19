import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../index.types';
import { Player } from './GameRoom.types';
import { exportedMachine } from '../game-state-machine/gameStateMachine';
import { GameContext, GameState } from '../multiplayerGame.types';

// Buffer added to round-end alarms so the FSM's expiry check always passes
const ROUND_END_ALARM_BUFFER_MS = 1000;

/**
 * GameRoom DO - Each instance represents a single multiplayer game room.
 */
export class GameRoom extends DurableObject {
	private gameContext: GameContext | null = null;

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
	}

	/**
	 * Initialize the game room with metadata and game context
	 */
	async initialize(gameOwnerId: string, timer: number): Promise<void> {
		await this.ctx.storage.put('gameOwnerId', gameOwnerId);
		await this.ctx.storage.put('timer', timer);

		// Initialize game context
		this.gameContext = exportedMachine.createGameContext({
			gameOwnerId,
			numberOfRounds: 5,
			timer: timer > 0 ? timer : undefined
		});
		await this.ctx.storage.put('gameContext', this.gameContext);
	}

	/**
	 * Load game context from storage
	 */
	private async loadGameContext(): Promise<void> {
		if (!this.gameContext) {
			this.gameContext = await this.ctx.storage.get<GameContext>('gameContext') || null;
		}
	}

	/**
	 * Save game context to storage and broadcast to all clients
	 */
	private async saveAndBroadcastGameState(): Promise<void> {
		if (this.gameContext) {
			await this.ctx.storage.put('gameContext', this.gameContext);
			this.broadcast({
				type: 'game_state',
				gameContext: this.gameContext
			});
		}
	}

	/**
	 * Schedule an alarm for when the current round's timer expires.
	 * The alarm fires slightly after the deadline so the state machine's
	 * expiry guard reliably passes regardless of alarm timing precision.
	 */
	private async scheduleRoundEndAlarm(): Promise<void> {
		if (!this.gameContext || this.gameContext.gameStateMachinePhase !== 'inRound') return;
		const currentRound = this.gameContext.rounds[this.gameContext.currentRound - 1];
		if (currentRound?.roundEndTimeStamp) {
			await this.ctx.storage.setAlarm(currentRound.roundEndTimeStamp + ROUND_END_ALARM_BUFFER_MS);
		}
	}

	/**
	 * Handle round timer expiry. Wakes the DO even if it was not active.
	 */
	async alarm(): Promise<void> {
		await this.loadGameContext();
		if (!this.gameContext || this.gameContext.gameStateMachinePhase !== 'inRound') return;

		try {
			const newState = await exportedMachine.machine.transition('roundComplete', this.gameContext);
			if (newState !== 'inRound') {
				console.log('Timer expired, moving to showRoundResult');
				await this.saveAndBroadcastGameState();
			}
		} catch (error) {
			console.error('Error completing round after timer expiry:', error);
		}
	}

	/**
	 * Get game metadata
	 */
	async getMetadata(): Promise<{ gameOwnerId: string | null; timer: number | null }> {
		const gameOwnerId = await this.ctx.storage.get<string>('gameOwnerId');
		const timer = await this.ctx.storage.get<number>('timer');
		return { gameOwnerId: gameOwnerId ?? null, timer: timer ?? null };
	}

	/**
	 * Handle incoming HTTP requests (WebSocket upgrades and HTTP methods)
	 */
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle HTTP methods for game room management
		if (request.method === 'POST' && url.pathname === '/initialize') {
			const body = await request.json() as { gameOwnerId: string; timer: number };
			await this.initialize(body.gameOwnerId, body.timer);
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (request.method === 'GET' && url.pathname === '/metadata') {
			const metadata = await this.getMetadata();
			return new Response(JSON.stringify(metadata), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Handle WebSocket upgrade
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket', { status: 426 });
		}

		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);
		this.ctx.acceptWebSocket(server);

		// Player properly set on player_join
		server.serializeAttachment({
			playerId: 'unknown',
			playerName: 'Unknown',
			isGuest: true
		});

		server.send(JSON.stringify({
			type: 'connected',
			message: 'Connected to game room',
			timestamp: Date.now()
		}));

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	private getPlayersList(): Player[] {
		const webSockets = this.ctx.getWebSockets();
		// Only include WebSockets that are in OPEN state (readyState === 1)
		// This filters out connections that are CLOSING (2) or CLOSED (3)
		const activeWebSockets = webSockets.filter(ws => ws.readyState === WebSocket.OPEN);
		return activeWebSockets
			.map(ws => {
				const player = ws.deserializeAttachment() as Player | undefined;
				return player || { playerId: 'unknown', playerName: 'Unknown', isGuest: true };
			})
			// Filter out unknown players - these are connections that haven't sent player_join yet
			.filter(player => player.playerId !== 'unknown');
	}

	private broadcastPlayerList(): void {
		const players = this.getPlayersList();
		this.broadcast({
			type: 'players_update',
			players,
			playerCount: players.length
		});
	}

	/**
	 * Guard helpers for WebSocket commands. Each sends a specific error to the
	 * requesting socket and returns a falsy value when the command is not allowed.
	 */
	private requireGameContext(ws: WebSocket): GameContext | null {
		if (this.gameContext) return this.gameContext;
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Game context not initialized'
		}));
		return null;
	}

	private requirePhase(ws: WebSocket, gameContext: GameContext, phase: GameState, action: string): boolean {
		if (gameContext.gameStateMachinePhase === phase) return true;
		ws.send(JSON.stringify({
			type: 'error',
			message: `Cannot ${action} - wrong game phase`
		}));
		return false;
	}

	private requireGameOwner(ws: WebSocket, gameContext: GameContext, action: string): boolean {
		const player = ws.deserializeAttachment() as Player | undefined;
		if (player?.playerId === gameContext.gameOwnerId) return true;
		ws.send(JSON.stringify({
			type: 'error',
			message: `Only the game owner can ${action}`
		}));
		return false;
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		try {
			const data = typeof message === 'string' ? JSON.parse(message) : message;

			await this.loadGameContext();

			switch (data.type) {
				case 'player_join':
					ws.serializeAttachment({
						playerId: data.playerId,
						playerName: data.playerName,
						isGuest: data.isGuest
					});

					// Add player to game context if not already present, or update existing player's name
					if (this.gameContext) {
						const existingPlayerIndex = this.gameContext.players.findIndex(p => p.playerId === data.playerId);
						if (existingPlayerIndex === -1) {
							this.gameContext.players.push({
								playerId: data.playerId,
								playerName: data.playerName,
								isGuest: data.isGuest
							});
						} else {
							this.gameContext.players[existingPlayerIndex].playerName = data.playerName;
						}
						await this.saveAndBroadcastGameState();
					}

					this.broadcastPlayerList();
					break;

				case 'game_start': {
					const gameContext = this.requireGameContext(ws);
					if (!gameContext) return;

					// Drop players who disconnected between games so they don't affect the next game
					gameContext.players = this.getPlayersList();

					// Trigger state machine transition from lobby to inRound
					try {
						const newState = await exportedMachine.machine.transition('startGame', gameContext);
						console.log('Game started, new state:', newState);
						await this.saveAndBroadcastGameState();
						await this.scheduleRoundEndAlarm();
					} catch (error) {
						console.error('Error starting game:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to start game'
						}));
					}
					break;
				}

				case 'next_round': {
					const gameContext = this.requireGameContext(ws);
					if (!gameContext) return;
					if (!this.requirePhase(ws, gameContext, 'showRoundResult', 'advance to the next round')) return;
					if (!this.requireGameOwner(ws, gameContext, 'advance to the next round')) return;

					try {
						const isLastRound = gameContext.currentRound === gameContext.numberOfRounds;

						if (isLastRound) {
							await exportedMachine.machine.transition('finishFinalRound', gameContext);
							console.log('Final round results viewed, moving to final scores');
						} else {
							await exportedMachine.machine.transition('continueToNextRound', gameContext);
							console.log('Continuing to next round:', gameContext.currentRound);
						}

						await this.saveAndBroadcastGameState();
						await this.scheduleRoundEndAlarm();
					} catch (error) {
						console.error('Error advancing round:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to advance to next round'
						}));
					}
					break;
				}

				case 'return_to_lobby': {
					const gameContext = this.requireGameContext(ws);
					if (!gameContext) return;
					if (!this.requirePhase(ws, gameContext, 'showResult', 'return to the lobby')) return;
					if (!this.requireGameOwner(ws, gameContext, 'return to the lobby')) return;

					try {
						await exportedMachine.machine.transition('gameEnded', gameContext);
						await this.ctx.storage.deleteAlarm();
						await this.saveAndBroadcastGameState();
					} catch (error) {
						console.error('Error returning to lobby:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to return to lobby'
						}));
					}
					break;
				}

				case 'update_settings': {
					const gameContext = this.requireGameContext(ws);
					if (!gameContext) return;
					if (!this.requirePhase(ws, gameContext, 'lobby', 'update settings')) return;
					if (!this.requireGameOwner(ws, gameContext, 'change settings')) return;

					const timer = Number(data.timer);
					if (!Number.isFinite(timer) || timer < 0) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Invalid timer value'
						}));
						return;
					}

					gameContext.timer = timer > 0 ? timer : undefined;
					await this.ctx.storage.put('timer', timer);
					await this.saveAndBroadcastGameState();
					break;
				}

				case 'submit_guess': {
					const gameContext = this.requireGameContext(ws);
					if (!gameContext) return;
					if (!this.requirePhase(ws, gameContext, 'inRound', 'submit a guess')) return;

					try {
						const { playerId, guessCoordinates } = data;
						const currentRoundIndex = gameContext.currentRound - 1;
						const currentRound = gameContext.rounds[currentRoundIndex];

						if (!currentRound) {
							throw new Error('Current round not found');
						}

						// Check if player already guessed this round
						const existingGuess = currentRound.playerGuesses.find(g => g.playerId === playerId);
						if (existingGuess) {
							ws.send(JSON.stringify({
								type: 'error',
								message: 'Already submitted guess for this round'
							}));
							return;
						}

						// Add the guess
						currentRound.playerGuesses.push({
							playerId,
							guessCoordinates
						});

						// Check if round is complete and transition to showRoundResult
						const allPlayersGuessed = currentRound.playerGuesses.length === gameContext.players.length;

						if (allPlayersGuessed) {
							await exportedMachine.machine.transition('roundComplete', gameContext);
							await this.ctx.storage.deleteAlarm();
							console.log('Round complete, moving to showRoundResult');
						}

						await this.saveAndBroadcastGameState();
					} catch (error) {
						console.error('Error submitting guess:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to submit guess'
						}));
					}
					break;
				}

				default:
					// Echo unknown messages back to sender
					ws.send(JSON.stringify({
						type: 'echo',
						data,
						timestamp: Date.now()
					}));
					break;
			}

		} catch (error) {
			console.error('Error handling message:', error);
			ws.send(JSON.stringify({
				type: 'error',
				message: 'Failed to process message'
			}));
		}
	}

	async webSocketClose(ws: WebSocket, code: number, _reason: string, wasClean: boolean): Promise<void> {
		const player = ws.deserializeAttachment() as Player | undefined;
		console.log(`[GameRoom] WebSocket closed. Player: ${player?.playerName} (${player?.playerId}), Code: ${code}, Clean: ${wasClean}`);
		this.broadcastPlayerList();
	}

	async webSocketError(_ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);

		this.broadcastPlayerList();
	}

	/**
	 * Broadcast a message to all connected clients (optionally excluding one)
	 */
	private broadcast(message: object, exclude?: WebSocket): void {
		const messageStr = JSON.stringify(message);
		const webSockets = this.ctx.getWebSockets();

		for (const ws of webSockets) {
			if (ws !== exclude) {
				try {
					ws.send(messageStr);
				} catch (error) {
					console.error('Error broadcasting to session:', error);
					ws.close(1011, 'Error broadcasting');
				}
			}
		}
	}
}
