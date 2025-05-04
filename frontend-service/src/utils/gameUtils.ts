import type { Round } from '../components/types/Game.types'
import { endpoints } from '../objects/endpoints'

const fetchRounds = async (): Promise<Round[]> => {
	const url = endpoints.locations.random
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		const roundsArray = await response.json();
		return roundsArray.data
	} catch (error) {
		throw error
	}
}

export { fetchRounds }
