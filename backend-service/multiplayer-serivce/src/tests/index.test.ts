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
        test('should return 400 when host identity missing', async () => {
                const timer = 60
                const res = await app.request('/create-game', {
                        method: 'POST',
                        body: JSON.stringify({ timer }),
                        headers: {
                                'Content-Type': 'application/json',
                        },
                })

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
                })

                expect(res.status).toBe(200)
                const json = await res.json()
                expect(json).toHaveProperty('gameCode')
                expect(json).toHaveProperty('timer', timer)
                expect(json).toHaveProperty('gameOwnerId', hostId)
        })
})

describe('GET /join-game', () => {
	test('should return roomId in object', async () => {
		const res = await app.request('/join-game/abcde')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toHaveProperty('roomId', 'ABCDE')
		expect(json).toHaveProperty('gameOwnerId', 'user_12345678')
	})
})