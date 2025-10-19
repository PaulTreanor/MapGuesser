import { DurableObject } from 'cloudflare:workers';

/**
 * GameRoom Durable Object
 *
 * Each instance represents a single multiplayer game room.
 * Manages WebSocket connections and broadcasts messages to all connected players.
 */
export class GameRoom extends DurableObject {
	private sessions: Set<WebSocket>;

	constructor(state: DurableObjectState, env: unknown) {
		super(state, env);
		this.sessions = new Set();
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

		// Add to our set of sessions
		this.sessions.add(server);

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
	 * Handle incoming WebSocket messages
	 */
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		try {
			// Parse the message
			const data = typeof message === 'string' ? JSON.parse(message) : message;

			console.log('Received message:', data);

			// Echo the message back to the sender
			ws.send(JSON.stringify({
				type: 'echo',
				data,
				timestamp: Date.now()
			}));

			// Broadcast to all other connected clients
			this.broadcast({
				type: 'player_message',
				data,
				timestamp: Date.now()
			}, ws);

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
		console.log('WebSocket closed:', { code, reason, wasClean });
		this.sessions.delete(ws);
		ws.close(code, reason);

		// Notify other players
		this.broadcast({
			type: 'player_left',
			timestamp: Date.now(),
			activeConnections: this.sessions.size
		});
	}

	/**
	 * Handle WebSocket error events
	 */
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);
		this.sessions.delete(ws);
		ws.close(1011, 'WebSocket error');
	}

	/**
	 * Broadcast a message to all connected clients (optionally excluding one)
	 */
	private broadcast(message: object, exclude?: WebSocket): void {
		const messageStr = JSON.stringify(message);

		for (const session of this.sessions) {
			if (session !== exclude) {
				try {
					session.send(messageStr);
				} catch (error) {
					console.error('Error broadcasting to session:', error);
					this.sessions.delete(session);
				}
			}
		}
	}
}
