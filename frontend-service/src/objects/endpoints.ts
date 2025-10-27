/**
 * API endpoints configuration
 * 
 * Uses .env.local, .env.development, and .env.production
 */

const LOCATIONS_SERVICE_API_URL =
	process.env.GATSBY_LOCATIONS_SERVICE_API_URL
	|| 'https://locations-service.treanorpaul9.workers.dev';

const MULTIPLAYER_SERVICE_API_URL =
	process.env.GATSBY_MULTIPLAYER_SERVICE_API_URL
	|| 'https://multiplayer-serivce.treanorpaul9.workers.dev';

export {
	LOCATIONS_SERVICE_API_URL,
	MULTIPLAYER_SERVICE_API_URL,
}