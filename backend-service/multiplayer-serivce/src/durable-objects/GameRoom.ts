import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../index.types';
import { Player } from './GameRoom.types';
import { exportedMachine } from '../game-state-machine/gameStateMachine';
import { GameContext } from '../multiplayerGame.types';

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

				case 'game_start':
					if (!this.gameContext) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Game context not initialized'
						}));
						return;
					}

					// Trigger state machine transition from lobby to inRound
					try {
						const newState = await exportedMachine.machine.transition('startGame', this.gameContext);
						console.log('Game started, new state:', newState);
						await this.saveAndBroadcastGameState();
					} catch (error) {
						console.error('Error starting game:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to start game'
						}));
					}
					break;

				case 'next_round':
					if (!this.gameContext) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Game context not initialized'
						}));
						return;
					}

					if (this.gameContext.gameStateMachinePhase !== 'showRoundResult') {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Cannot advance round - not in round results phase'
						}));
						return;
					}

					// Only game owner can advance to next round
					const player = ws.deserializeAttachment() as Player | undefined;
					if (player?.playerId !== this.gameContext.gameOwnerId) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Only the game owner can advance to the next round'
						}));
						return;
					}

					try {
						const isLastRound = this.gameContext.currentRound === this.gameContext.numberOfRounds;

						if (isLastRound) {
							await exportedMachine.machine.transition('finishFinalRound', this.gameContext);
							console.log('Final round results viewed, moving to final scores');
						} else {
							await exportedMachine.machine.transition('continueToNextRound', this.gameContext);
							console.log('Continuing to next round:', this.gameContext.currentRound);
						}

						await this.saveAndBroadcastGameState();
					} catch (error) {
						console.error('Error advancing round:', error);
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Failed to advance to next round'
						}));
					}
					break;

				case 'submit_guess':
					if (!this.gameContext) {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Game context not initialized'
						}));
						return;
					}

					if (this.gameContext.gameStateMachinePhase !== 'inRound') {
						ws.send(JSON.stringify({
							type: 'error',
							message: 'Cannot submit guess - game is not in round'
						}));
						return;
					}

					try {
						const { playerId, guessCoordinates } = data;
						const currentRoundIndex = this.gameContext.currentRound - 1;
						const currentRound = this.gameContext.rounds[currentRoundIndex];

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
						const allPlayersGuessed = currentRound.playerGuesses.length === this.gameContext.players.length;

						if (allPlayersGuessed) {
							await exportedMachine.machine.transition('roundComplete', this.gameContext);
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
