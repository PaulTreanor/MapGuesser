import { create } from 'zustand'
import type { CurrentRound } from '../components/types/Game.types'

interface RoundStore {
	// Current round state
	currentRound: CurrentRound;
	
	// Actions
	completeRound: () => void;
	moveToNextRound: () => void;
	resetRound: () => void;
}

const useRoundStore = create<RoundStore>((set) => ({
	// State
	currentRound: {
		index: 0,
		completed: false
	},
	
	// Actions
	completeRound: () => set((state) => ({
		currentRound: {
			...state.currentRound,
			completed: true
		}
	})),
	
	moveToNextRound: () => set((state) => ({
		currentRound: {
			index: state.currentRound.index + 1,
			completed: false
		}
	})),
	
	resetRound: () => set({
		currentRound: {
			index: 0,
			completed: false
		}
	})
}))

export { useRoundStore }