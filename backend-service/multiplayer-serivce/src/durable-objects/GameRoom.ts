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
	private sessions: Map<WebSocket, Player>;

	constructor(state: DurableObjectState, env: unknown) {
		super(state, env);
		this.sessions = new Map();
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

		// Accept the WebSocket connection
		this.ctx.acceptWebSocket(server);

		// Add to our map of sessions (player info will be added when they send player_join message)
		this.sessions.set(server, {
			playerId: 'unknown',
			playerName: 'Unknown',
			isGuest: true
		});

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
		return Array.from(this.sessions.values());
	}

	/**
	 * Broadcast player list update to all clients
	 */
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
			// Parse the message
			const data = typeof message === 'string' ? JSON.parse(message) : message;

			console.log('Received message:', data);

			// Handle different message types
			switch (data.type) {
				case 'player_join':
					// Update player info for this connection
					this.sessions.set(ws, {
						playerId: data.playerId,
						playerName: data.playerName,
						isGuest: data.isGuest
					});

					// Broadcast updated player list to all
					this.broadcastPlayerList();

					console.log(`Player joined: ${data.playerName} (${data.playerId})`);
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
		const player = this.sessions.get(ws);
		console.log('WebSocket closed:', { code, reason, wasClean, player: player?.playerName });

		this.sessions.delete(ws);

		// Broadcast updated player list to remaining connections
		this.broadcastPlayerList();
	}

	/**
	 * Handle WebSocket error events
	 */
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);
		this.sessions.delete(ws);

		// Broadcast updated player list
		this.broadcastPlayerList();
	}

	/**
	 * Broadcast a message to all connected clients (optionally excluding one)
	 */
	private broadcast(message: object, exclude?: WebSocket): void {
		const messageStr = JSON.stringify(message);

		for (const [ws] of this.sessions) {
			if (ws !== exclude) {
				try {
					ws.send(messageStr);
				} catch (error) {
					console.error('Error broadcasting to session:', error);
					this.sessions.delete(ws);
				}
			}
		}
	}
}
