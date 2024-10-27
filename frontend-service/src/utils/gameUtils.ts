import roundsData from "../data/rounds.json"
import type {Round } from '../Types'

// Swap this out once the locations API is ready. 
const fetchRounds = (): Round[]  => {
	// Create copy to avoid mutating the original data
	const generalRoundsList = [...roundsData.generalEurope]
	const randomRounds: Round[] = []
	for (let i = 0; i < 5; i++) {
		if (generalRoundsList.length === 0) {
			// break if there are no more rounds to select
			break; 
		}
		const randomIndex = Math.floor(Math.random() * generalRoundsList.length)
		randomRounds.push(generalRoundsList[randomIndex] as Round)
		// Remove the selected round from the list so we don't get same round twice
		generalRoundsList.splice(randomIndex, 1) 
	}
	return randomRounds
}

export { fetchRounds }
