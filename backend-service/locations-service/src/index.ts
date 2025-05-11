import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env, Location } from './types'

// Create app with proper type
const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
	origin: (origin, _c) => {
		if (!origin) return '*'

		const allowedDomains = ['localhost', '127.0.0.1', 'mapguesser.com']

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
 * GET /locations
 * @description Returns all locations
 * 
 * @returns {Response} A JSON response containing an array of locations or an error.
 */
app.get('/locations', async (c) => {
	const result = await c.env.LOCATIONS_DB.prepare(
		"SELECT id, location, latitude, longitude FROM locations"
	).all<Location>();
	
	return c.json({ data: result.results || [] });
});

/**
 * GET /locations/random
 * @description Returns a random selection of locations based on query param criteria
 *
 * @param {object} c - Hono context obj
 * @param {number} [count=1] - The number of random locations to return. Must be a positive integer. Defaults to 1.
 *
 * @returns {Response} A JSON response containing an array of locations or an error.
 */
app.get('/locations/random', async (c) => {
	const count = parseInt(c.req.query('count') || '1', 10);

	if (isNaN(count) || count < 1) {
		return c.json({
			error: 'Invalid count parameter. Must be positive number.',
		}, 400);
	}

	// Fetch DB IDs (add filters here in the future)
	const idResult = await c.env.LOCATIONS_DB.prepare(
		"SELECT id FROM locations"
	).all<{ id: number }>();

	const allIds = idResult.results?.map(row => row.id) || [];

	if (allIds.length === 0) {
		return c.json({ data: [] });
	}

	// Randomly select the requested number of DB IDs
	const shuffled = allIds.sort(() => Math.random() - 0.5);
	const selectedIds = shuffled.slice(0, Math.min(count, allIds.length));

	// Fetch location information of random IDs
	const placeholders = selectedIds.map(() => '?').join(',');
	const locationResult = await c.env.LOCATIONS_DB.prepare(
		`SELECT id, location, latitude, longitude FROM locations WHERE id IN (${placeholders})`
	).bind(...selectedIds).all<Location>();

	const locations = locationResult.results || [];

	return c.json({
		data: locations.map((loc: Location) => ({
			location: loc.location,
			coordinates: [loc.longitude, loc.latitude]
		}))
	});
});

export default app
