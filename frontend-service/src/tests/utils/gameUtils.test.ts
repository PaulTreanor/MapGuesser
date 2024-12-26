import { test, expect, describe, vi} from 'vitest';
import { fetchRounds } from '../../utils/gameUtils'

describe('fetchRounds', () => {
	test('should return maximum 5 rounds', () => {
        const rounds = fetchRounds()
		expect(rounds.length).toBeLessThanOrEqual(5)
	})

	test('should return unique rounds', () => {
		const rounds = fetchRounds()
		const uniqueRounds = new Set(rounds.map(r => r.location))
		expect(uniqueRounds.size).toBe(rounds.length)
	})

	test('should handle empty data gracefully', () => {
		vi.mock('../../data/rounds.json', () => ({
            default: {
                generalEurope: []
            }
        }))
		const rounds = fetchRounds()
		expect(rounds).toEqual([])
	})
})