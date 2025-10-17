/**
 * API endpoints configuration
 * 
 * Uses environment variables to determine the base URL:
 * - GATSBY_LOCATIONS_SERVICE_API_URL: Base URL for the locations service API
 * - GATSBY_MULTIPLAYER_SERVICE_API_URL: Base URL for the multiplayer service API
 */

const API_URL = process.env.GATSBY_LOCATIONS_SERVICE_API_URL || 'https://locations-service.treanorpaul9.workers.dev';
const MULTIPLAYER_SERVICE_API_URL = process.env.GATSBY_MULTIPLAYER_SERVICE_API_URL || 'https://multiplayer-serivce.treanorpaul9.workers.dev';

const endpoints = {
	locations: {
		random: `${API_URL}/locations/random?count=5`
	}
	
}

export {
	endpoints,
	MULTIPLAYER_SERVICE_API_URL
}