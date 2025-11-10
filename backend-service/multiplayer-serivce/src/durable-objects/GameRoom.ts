import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../index.types';
import { Player } from './GameRoom.types';

/**
 * GameRoom DO - Each instance represents a single multiplayer game room.
 */
export class GameRoom extends DurableObject {
	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
	}

	/**
	 * Initialize the game room with metadata
	 */
	async initialize(gameOwnerId: string, timer: number): Promise<void> {
		await this.ctx.storage.put('gameOwnerId', gameOwnerId);
		await this.ctx.storage.put('timer', timer);
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

			switch (data.type) {
				case 'player_join':
					ws.serializeAttachment({
						playerId: data.playerId,
						playerName: data.playerName,
						isGuest: data.isGuest
					});

					this.broadcastPlayerList();
					break;

				case 'game_start':
					this.broadcast({
						type: 'game_starting',
						message: 'The game is starting!',
						timestamp: Date.now()
					});
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
