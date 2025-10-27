import { describe, test, expect, vi } from 'vitest';
import { getMultiplayerServiceWebsocketsUrl, buildLocationsApiEndpoint } from '../../utils/endpointUtils';

// Mock the endpoints module
vi.mock('../../objects/endpoints', () => ({
	LOCATIONS_SERVICE_API_URL: 'https://locations-service.example.com',
	MULTIPLAYER_SERVICE_API_URL: 'https://multiplayer-service.example.com',
}));

describe('Endpoint Utilities', () => {
	describe('getMultiplayerServiceWebsocketsUrl', () => {
		test('should convert https URL to wss URL', () => {
			const result = getMultiplayerServiceWebsocketsUrl();
			expect(result).toBe('wss://multiplayer-service.example.com/ws/');
		});
	});

	describe('buildLocationsApiEndpoint', () => {
		test('should build endpoint URL with count parameter', () => {
			const result = buildLocationsApiEndpoint(5);
			expect(result).toBe('https://locations-service.example.com/locations/random?count=5');
		});

		test('should handle different count values', () => {
			expect(buildLocationsApiEndpoint(1)).toContain('count=1');
			expect(buildLocationsApiEndpoint(10)).toContain('count=10');
		});
	});
});
