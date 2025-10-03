import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

type Bindings = {
	CLERK_PUBLISHABLE_KEY: string;
	CLERK_SECRET_KEY: string;
}

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

	// TODO: Generate unique game code properly
	const gameCode = 'ABC123';

	return c.json({
		gameCode,
		timer,
		userId: auth.userId,
	});
})

/**
 * GET /join-game
 * @description Resolves room data from join code
 */
app.get('/join-game/:code', async (c) => {
  const raw = c.req.param('code') ?? '';
  const code = raw.trim().toUpperCase();

  return c.json(
    {
      roomId: code,
      status: "...",
      expiresAt: "...",
	  wsUrl: "...",
    }
  );
})

export default app
