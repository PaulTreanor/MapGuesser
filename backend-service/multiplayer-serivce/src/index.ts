import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
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
 * @description Creates a new multiplayer game (requires authentication)
 */
app.post('/create-game', clerkMiddleware(), async (c) => {
	const auth = getAuth(c);

	if (!auth?.userId) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const { timer } = await c.req.json();
	const gameCode = generateGameCode();

	return c.json({
		gameCode,
		timer,
		gameOwnerId: auth.userId,
	});
})

/**
 * GET /join-game
 * @description Resolves room data from join code
 */
app.get('/join-game/:code', async (c) => {
	const raw = c.req.param('code') ?? '';
	const code = raw.trim().toUpperCase();

	return c.json({
		roomId: code,
		status: "...",
		expiresAt: "...",
		wsUrl: "...",
		// Harcode this for now
		gameOwnerId: "user_12345678"
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
