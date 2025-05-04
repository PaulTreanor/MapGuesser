import { Hono } from 'hono'
import { locationsDatabase } from './locations-data'

const app = new Hono()

const getRandomLocations = (locations: any[], count: number) => {
  const locationsCopy = [...locations];
  const randomLocations = [];

  for (let i = 0; i < count; i++) {
    if (locationsCopy.length === 0) { break };
    const randomIndex = Math.floor(Math.random() * locationsCopy.length);
    randomLocations.push(locationsCopy[randomIndex]);
    locationsCopy.splice(randomIndex, 1);
  }

  return randomLocations;
}

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
app.get('/locations', (c) => {
  console.log("h")
  console.log({locationsDatabase})
  return c.json({ data: locationsDatabase });
})

/**
 * GET /locations/random
 * @description Returns a random selection of locations based on query param criteria
 *
 * @param {object} c - Hono context obj
 * @param {number} [count=1] - The number of random locations to return. Must be a positive integer. Defaults to 1.
 *
 * @returns {Response} A JSON response containing an array of locations or an error.
 */
app.get('/locations/random', (c) => {
  const count = parseInt(c.req.query('count') || '1', 10);

  if (isNaN(count) || count < 1) {
    return c.json({
      error: 'Invalid count parameter. Must be positive number.',
    }, 400)
  }

  // Thinking that in future I should pass entire object of params into 
  // this method for SQL query but that is for another time!
  const randomLocations = getRandomLocations(locationsDatabase, count);
  return c.json({ data: randomLocations });
})



export default app
