import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../index'
import * as locationsModule from '../locations-data'

describe('GET /health', () => {
	it('should return status ok', async () => {
		const res = await app.request('/health')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toEqual({ status: 'ok' })
	})
})

describe('GET /locations', () => {
	it('should return all locations', async () => {
		const fakeLocations = [
			{ location: 'Paris', coordinates: [2.3522, 48.8566] },
			{ location: 'Tokyo', coordinates: [139.6917, 35.6895] }
		]
		vi.spyOn(locationsModule, 'locationsDatabase', 'get').mockReturnValue(fakeLocations)

		const res = await app.request('/locations')
		expect(res.status).toBe(200)
		const json = await res.json()
		expect(json).toEqual({ data: fakeLocations })
	})
})

describe('GET /locations/random', () => {
	beforeEach(() => {
		vi.restoreAllMocks()
	})

	it('should return 1 random location by default', async () => {
		const fakeLocations = [
			{ location: 'Paris', coordinates: [2.3522, 48.8566] },
			{ location: 'Tokyo', coordinates: [139.6917, 35.6895] }
		]
		vi.spyOn(locationsModule, 'locationsDatabase', 'get').mockReturnValue(fakeLocations)

		const res = await app.request('/locations/random')
		const json = await res.json()

		expect(res.status).toBe(200)
		expect(json.data.length).toBe(1)
		expect(fakeLocations.some(loc => 
			loc.location === json.data[0].location && 
			loc.coordinates[0] === json.data[0].coordinates[0] && 
			loc.coordinates[1] === json.data[0].coordinates[1]
		)).toBe(true)
	})

	it('returns 400 for invalid count param', async () => {
		const res = await app.request('/locations/random?count=notanumber')
		expect(res.status).toBe(400)
		const json = await res.json()
		expect(json).toHaveProperty('error')
	})

	it('respects the count param', async () => {
		const fakeLocations = [
			{ location: 'Paris', coordinates: [2.3522, 48.8566] },
			{ location: 'Tokyo', coordinates: [139.6917, 35.6895] },
			{ location: 'Dublin', coordinates: [-6.2603, 53.3498] }
		]
		vi.spyOn(locationsModule, 'locationsDatabase', 'get').mockReturnValue(fakeLocations)

		const res = await app.request('/locations/random?count=2')
		const json = await res.json()

		expect(res.status).toBe(200)
		expect(json.data.length).toBe(2)
	})
})
