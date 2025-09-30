import { describe, test, expect } from 'vitest'
import app from '../index'

describe('GET /health', () => {
	test('should return status ok', async () => {
		const res = await app.request('/health')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toEqual({ status: 'ok' })
	})
})

describe('POST /create-game', () => {
	test('should create a game with timer property', async () => {
		const timer = 60
		const res = await app.request('/create-game', {
			method: 'POST',
			body: JSON.stringify({ timer }),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('message', 'Game created')
		expect(json).toHaveProperty('timer', timer)
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