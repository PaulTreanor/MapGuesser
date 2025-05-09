import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../index'

const fakeLocations = [
	{ id: 1, location: 'Paris', latitude: 48.8566, longitude: 2.3522 },
	{ id: 2, location: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
	{ id: 3, location: 'Dublin', latitude: 53.3498, longitude: -6.2603 }
]

// Create a mock D1 database
function createMockDb() {
	return {
		prepare: vi.fn().mockImplementation((query) => {
			return {
				bind: vi.fn().mockImplementation((count) => {
					// For /locations/random endpoint with count param
					const results = count ? fakeLocations.slice(0, count) : [fakeLocations[0]]
					
					return {
						all: vi.fn().mockResolvedValue({
							results: results,
							success: true,
							meta: {}
						})
					}
				}),
				all: vi.fn().mockResolvedValue({
					results: fakeLocations,
					success: true,
					meta: {}
				})
			}
		}),
	}
}

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
		const mockDb = createMockDb()
		const mockEnv = { LOCATIONS_DB: mockDb }
		
		const res = await app.request('/locations', {}, mockEnv)
		
		expect(res.status).toBe(200)
		const json = await res.json()
		
		expect(mockDb.prepare).toHaveBeenCalledWith(
			"SELECT id, location, latitude, longitude FROM locations"
		)
		
		expect(json).toEqual({ data: fakeLocations })
	})
})

describe('GET /locations/random', () => {
	beforeEach(() => {
		vi.restoreAllMocks()
	})

	it('should return 1 random location by default', async () => {
		const mockDb = createMockDb()
		const mockEnv = { LOCATIONS_DB: mockDb }
		
		const res = await app.request('/locations/random', {}, mockEnv)
		
		expect(res.status).toBe(200)
		const json = await res.json()
		
		expect(mockDb.prepare).toHaveBeenCalledWith(
			"SELECT id, location, latitude, longitude FROM locations ORDER BY RANDOM() LIMIT ?"
		)
		
		// The API transforms the database results to match the expected format
		const expectedLocation = {
			location: fakeLocations[0].location,
			coordinates: [fakeLocations[0].longitude, fakeLocations[0].latitude]
		}
		
		expect(json.data.length).toBe(1)
		expect(json.data[0]).toEqual(expectedLocation)
	})

	it('returns 400 for invalid count param', async () => {
		const mockDb = createMockDb()
		const mockEnv = { LOCATIONS_DB: mockDb }
		
		const res = await app.request('/locations/random?count=notanumber', {}, mockEnv)
		
		expect(res.status).toBe(400)
		const json = await res.json()
		expect(json).toHaveProperty('error')
	})

	it('respects the count param', async () => {
		const mockDb = createMockDb()
		const mockEnv = { LOCATIONS_DB: mockDb }
		
		const res = await app.request('/locations/random?count=2', {}, mockEnv)
		
		expect(res.status).toBe(200)
		const json = await res.json()
		
		expect(mockDb.prepare).toHaveBeenCalledWith(
			"SELECT id, location, latitude, longitude FROM locations ORDER BY RANDOM() LIMIT ?"
		)
		
		// Check that we get the expected transformed format with 2 items
		const expectedLocations = [
			{
				location: fakeLocations[0].location,
				coordinates: [fakeLocations[0].longitude, fakeLocations[0].latitude]
			},
			{
				location: fakeLocations[1].location,
				coordinates: [fakeLocations[1].longitude, fakeLocations[1].latitude]
			}
		]
		
		expect(json.data.length).toBe(2)
		expect(json.data).toEqual(expectedLocations)
	})
})