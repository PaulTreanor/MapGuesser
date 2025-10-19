import { DurableObject } from 'cloudflare:workers';

type Player = {
	playerId: string;
	playerName: string;
	isGuest: boolean;
};

/**
 * GameRoom Durable Object
 *
 * Each instance represents a single multiplayer game room.
 * Manages WebSocket connections and broadcasts messages to all connected players.
 */
export class GameRoom extends DurableObject {
	constructor(state: DurableObjectState, env: unknown) {
		super(state, env);
		console.log(`🎮 GameRoom constructor called. ID: ${state.id.toString()}`);
		console.log(`Existing WebSockets on construction: ${this.ctx.getWebSockets().length}`);
	}

	/**
	 * Handle incoming HTTP requests (WebSocket upgrades)
	 */
	async fetch(request: Request): Promise<Response> {
		// Check if this is a WebSocket upgrade request
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket', { status: 426 });
		}

		// Create WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// Accept the WebSocket connection with empty metadata (will be set on player_join)
		this.ctx.acceptWebSocket(server);

		// Serialize initial player data as attachment
		server.serializeAttachment({
			playerId: 'unknown',
			playerName: 'Unknown',
			isGuest: true
		});

		const totalSessions = this.ctx.getWebSockets().length;
		console.log(`New WebSocket connected. Total sessions: ${totalSessions}`);

		// Send welcome message
		server.send(JSON.stringify({
			type: 'connected',
			message: 'Connected to game room',
			timestamp: Date.now()
		}));

		// Return the client-side WebSocket to the caller
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	/**
	 * Get list of all players
	 */
	private getPlayersList(): Player[] {
		const webSockets = this.ctx.getWebSockets();
		return webSockets.map(ws => {
			const player = ws.deserializeAttachment() as Player | undefined;
			return player || { playerId: 'unknown', playerName: 'Unknown', isGuest: true };
		});
	}

	/**
	 * Broadcast player list update to all clients
	 */
	private broadcastPlayerList(): void {
		const players = this.getPlayersList();
		console.log(`Broadcasting player list. Count: ${players.length}`);
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
			// Parse the message
			const data = typeof message === 'string' ? JSON.parse(message) : message;

			console.log('Received message:', data);

			// Handle different message types
			switch (data.type) {
				case 'player_join':
					// Update player info for this connection using serializeAttachment
					ws.serializeAttachment({
						playerId: data.playerId,
						playerName: data.playerName,
						isGuest: data.isGuest
					});

					console.log(`Player joined: ${data.playerName} (${data.playerId})`);

					const allPlayers = this.getPlayersList();
					console.log(`Total sessions in DO: ${this.ctx.getWebSockets().length}`);
					console.log('All players in DO:', allPlayers.map(p => `${p.playerName} (${p.playerId})`));

					// Broadcast updated player list to all
					this.broadcastPlayerList();
					break;

				case 'game_start':
					console.log('Game starting...');

					// Broadcast game start to all players
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

	/**
	 * Handle WebSocket close events
	 */
	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
		const player = ws.deserializeAttachment() as Player | undefined;
		console.log('WebSocket closed:', { code, reason, wasClean, player: player?.playerName });
		console.log(`After close, total sessions: ${this.ctx.getWebSockets().length}`);

		// Broadcast updated player list to remaining connections
		this.broadcastPlayerList();
	}

	/**
	 * Handle WebSocket error events
	 */
	async webSocketError(_ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);

		// Broadcast updated player list
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
