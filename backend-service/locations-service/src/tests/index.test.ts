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

// Create a mock D1 database for new random logic
function createMockDbNewRandom(selectedIds = [1]) {
	return {
		prepare: vi.fn().mockImplementation((query) => {
			if (query === 'SELECT id FROM locations') {
				return {
					all: vi.fn().mockResolvedValue({
						results: fakeLocations.map(l => ({ id: l.id })),
						success: true,
						meta: {}
					})
				}
			}
			if (query.startsWith('SELECT id, location, latitude, longitude FROM locations WHERE id IN')) {
				return {
					bind: vi.fn().mockImplementation((...ids) => {
						const results = fakeLocations.filter(l => ids.includes(l.id))
						return {
							all: vi.fn().mockResolvedValue({
								results,
								success: true,
								meta: {}
							})
						}
					})
				}
			}
			// fallback for other queries
			return {
				all: vi.fn().mockResolvedValue({ results: [], success: true, meta: {} })
			}
		})
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

	it('returns 400 for invalid count param', async () => {
		const mockDb = createMockDbNewRandom()
		const mockEnv = { LOCATIONS_DB: mockDb }

		const res = await app.request('/locations/random?count=notanumber', {}, mockEnv)

		expect(res.status).toBe(400)
		const json = await res.json()
		expect(json).toHaveProperty('error')
	})

	it('respects the count param', async () => {
		const mockDb = createMockDbNewRandom([1, 2])
		const mockEnv = { LOCATIONS_DB: mockDb }

		const res = await app.request('/locations/random?count=2', {}, mockEnv)

		expect(res.status).toBe(200)
		const json = await res.json()

		expect(mockDb.prepare).toHaveBeenCalledWith('SELECT id FROM locations')
		expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, location, latitude, longitude FROM locations WHERE id IN'))

		expect(json.data).toHaveLength(2)
		// Check that each returned location is valid (exists in fakeLocations)
		json.data.forEach((loc: any) => {
			expect([
				{
					location: fakeLocations[0].location,
					coordinates: [fakeLocations[0].longitude, fakeLocations[0].latitude]
				},
				{
					location: fakeLocations[1].location,
					coordinates: [fakeLocations[1].longitude, fakeLocations[1].latitude]
				},
				{
					location: fakeLocations[2].location,
					coordinates: [fakeLocations[2].longitude, fakeLocations[2].latitude]
				}
			]).toContainEqual(loc)
		})
	})
})