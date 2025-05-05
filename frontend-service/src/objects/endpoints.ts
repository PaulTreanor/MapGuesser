/**
 * API endpoints configuration
 * 
 * Uses environment variables to determine the base URL:
 * - GATSBY_API_URL: Base URL for the backend API
 */

const API_URL = process.env.GATSBY_API_URL || 'https://locations-service.treanorpaul9.workers.dev';

const endpoints = {
	locations: {
		random: `${API_URL}/locations/random?count=5`
	}
}

export { endpoints }