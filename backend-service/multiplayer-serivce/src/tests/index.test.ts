import { describe, test, expect, beforeEach, vi } from 'vitest'
import app from '../index'

// Mock environment with GAME_ROOM Durable Object and database
const mockEnv = {
	GAME_ROOM: {
		idFromName: vi.fn((name: string) => name),
		get: vi.fn(() => ({
			fetch: vi.fn(async (url: string, options?: RequestInit) => {
				const urlObj = new URL(url);

				if (options?.method === 'POST' && urlObj.pathname === '/initialize') {
					return new Response(JSON.stringify({ success: true }), {
						headers: { 'Content-Type': 'application/json' }
					});
				}

				if (options?.method === 'GET' && urlObj.pathname === '/metadata') {
					// Return mock metadata - in real scenario this would be from storage
					return new Response(JSON.stringify({
						gameOwnerId: 'guest_123',
						timer: 60
					}), {
						headers: { 'Content-Type': 'application/json' }
					});
				}

				return new Response('Not found', { status: 404 });
			})
		}))
	},
	mapguesser_game_registry: {
		prepare: vi.fn((query: string) => ({
			bind: vi.fn((..._args: unknown[]) => ({
				run: vi.fn(async () => ({ success: true })),
				first: vi.fn(async () => ({ game_code: 'ABCDE' }))
			}))
		}))
	}
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe('GET /health', () => {
	test('should return status ok', async () => {
		const res = await app.request('/health')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toEqual({ status: 'ok' })
	})
})

describe('POST /create-game', () => {
	test('should return 400 when host identity missing', async () => {
		const timer = 60
		const res = await app.request('/create-game', {
			method: 'POST',
			body: JSON.stringify({ timer }),
			headers: {
					'Content-Type': 'application/json',
			},
		}, mockEnv)

		expect(res.status).toBe(400)
		const json = await res.json()
		expect(json).toHaveProperty('error', 'Host identity required')
	})

	test('should create a game with timer and return gameCode when host identity provided', async () => {
		const timer = 60
		const hostId = 'guest_123'
		const res = await app.request('/create-game', {
			method: 'POST',
			body: JSON.stringify({ timer, hostId }),
			headers: {
					'Content-Type': 'application/json',
			},
		}, mockEnv)

		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('gameCode')
		expect(json).toHaveProperty('timer', timer)
		expect(json).toHaveProperty('gameOwnerId', hostId)
	})
})

describe('GET /join-game', () => {
	test('should return roomId in object', async () => {
		const res = await app.request('/join-game/abcde', {}, mockEnv)
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('roomId', 'ABCDE')
		expect(json).toHaveProperty('gameOwnerId', 'guest_123')
	})
})