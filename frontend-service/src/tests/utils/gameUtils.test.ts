import { test, expect, describe, vi} from 'vitest';
import { fetchRounds } from '../../utils/gameUtils'

describe('fetchRounds', () => {
	test('should return maximum 5 rounds', async () => {
        const rounds = await fetchRounds()
		expect(rounds.length).toBeLessThanOrEqual(5)
	})

	test('should return unique rounds', async () => {
		const rounds = await fetchRounds()
		const uniqueRounds = new Set(rounds.map(r => r.location))
		expect(uniqueRounds.size).toBe(rounds.length)
	})
})