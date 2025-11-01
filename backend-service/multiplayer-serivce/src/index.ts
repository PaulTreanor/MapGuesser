import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GameRoom } from './durable-objects/GameRoom'
import { Bindings } from './index.types'
import { generateGameCode } from './multiplayerUtils'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
	origin: (origin, _c) => {
		if (!origin) return '*'

		const allowedDomains = ['localhost', '127.0.0.1', 'mapguesser.com', 'vercel.app']

		try {
			const { hostname } = new URL(origin)
			const isAllowed = allowedDomains.some(domain =>
				hostname === domain || hostname.endsWith(`.${domain}`)
			)

			return isAllowed ? origin : null
		} catch {
			return null
		}
	},
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['*'],
}))

/**
 * GET /health
 * @description Simple health check endpoint
 */
app.get('/health', (c) => {
	return c.json({ status: 'ok' });
})

/**
 * POST /create-game
 * @description Creates a new multiplayer game (host identity supplied by client)
 */
app.post('/create-game', async (c) => {
        const { timer, hostId } = await c.req.json();

        if (!hostId) {
                return c.json({ error: 'Host identity required' }, 400);
        }

        const gameCode = generateGameCode();

        // Initialize the GameRoom with host information
        const id = c.env.GAME_ROOM.idFromName(gameCode);
        const stub = c.env.GAME_ROOM.get(id);
        await stub.fetch('http://internal/initialize', {
                method: 'POST',
                body: JSON.stringify({ gameOwnerId: hostId, timer }),
                headers: { 'Content-Type': 'application/json' }
        });

        return c.json({
                gameCode,
                timer,
                gameOwnerId: hostId,
        });
})

/**
 * GET /join-game
 * @description Resolves room data from join code
 */
app.get('/join-game/:code', async (c) => {
	const raw = c.req.param('code') ?? '';
	const code = raw.trim().toUpperCase();

	// Fetch metadata from the GameRoom
	const id = c.env.GAME_ROOM.idFromName(code);
	const stub = c.env.GAME_ROOM.get(id);
	const metadataResponse = await stub.fetch('http://internal/metadata', {
		method: 'GET'
	});
	const metadata = await metadataResponse.json() as { gameOwnerId: string | null; timer: number | null };

	return c.json({
		roomId: code,
		status: "...",
		expiresAt: "...",
		wsUrl: "...",
		gameOwnerId: metadata.gameOwnerId
	});
})

/**
 * GET /ws/:gameCode
 * @description WebSocket endpoint for connecting to a game room
 */
app.get('/ws/:gameCode', async (c) => {
	const gameCode = c.req.param('gameCode')?.toUpperCase();

	if (!gameCode) {
		return c.json({ error: 'Game code required' }, 400);
	}

	const id = c.env.GAME_ROOM.idFromName(gameCode);
	const stub = c.env.GAME_ROOM.get(id);

	return stub.fetch(c.req.raw);
})

export default app
export { GameRoom }
