import { describe, test, expect, vi, beforeEach } from 'vitest'
import app from '../index'

// Mock the Clerk auth module
vi.mock('@hono/clerk-auth', () => ({
	clerkMiddleware: () => {
		return async (c: any, next: any) => {
			// Store mock auth data in context for getAuth to retrieve
			c.set('clerk', { userId: c.req.header('x-mock-user-id') || null });
			await next();
		}
	},
	getAuth: (c: any) => {
		return c.get('clerk');
	},
}))

describe('GET /health', () => {
	test('should return status ok', async () => {
		const res = await app.request('/health')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toEqual({ status: 'ok' })
	})
})

describe('POST /create-game', () => {
	test('should return 401 when no auth provided', async () => {
		const timer = 60
		const res = await app.request('/create-game', {
			method: 'POST',
			body: JSON.stringify({ timer }),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		expect(res.status).toBe(401)
		const json = await res.json()
		expect(json).toHaveProperty('error', 'Unauthorized')
	})

	test('should create a game with timer and return gameCode when authenticated', async () => {
		const timer = 60
		const res = await app.request('/create-game', {
			method: 'POST',
			body: JSON.stringify({ timer }),
			headers: {
				'Content-Type': 'application/json',
				'x-mock-user-id': 'user_123',
			},
		})

		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('gameCode')
		expect(json).toHaveProperty('timer', timer)
		expect(json).toHaveProperty('userId', 'user_123')
	})
})

describe('GET /join-game', () => {
	test('should return roomId in object', async () => {
		const res = await app.request('/join-game/abcde')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('roomId', 'ABCDE')
	})
})