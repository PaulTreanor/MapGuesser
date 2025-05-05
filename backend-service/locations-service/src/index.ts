import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

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
app.get('/locations', async (c: any) => {
	const { results } = await c.env.LOCATIONS_DB.prepare(
		"SELECT id, location, latitude, longitude FROM locations"
	).all();
	
	return c.json({ data: results });
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
app.get('/locations/random', async (c:any) => {
	const count = parseInt(c.req.query('count') || '1', 10);
	
	if (isNaN(count) || count < 1) {
		return c.json({
			error: 'Invalid count parameter. Must be positive number.',
		}, 400);
	}
	
	const { results } = await c.env.LOCATIONS_DB.prepare(
		"SELECT id, location, latitude, longitude FROM locations ORDER BY RANDOM() LIMIT ?"
	).bind(count).all();
	
	return c.json({ data: results.map((loc: { location: any; longitude: any; latitude: any }) => ({
		location: loc.location,
		coordinates: [loc.longitude, loc.latitude]
	})) });
});

export default app
