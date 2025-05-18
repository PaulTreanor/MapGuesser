import { create } from 'zustand'
import type { CurrentRound } from '../components/types/Game.types'

interface RoundStore {
	// Current round state
	currentRound: CurrentRound;
	roundEndTimeStamp: number | null;
	
	// Actions
	completeRound: () => void;
	moveToNextRound: () => void;
	resetRound: () => void;
	setRoundEndTimeStamp: (timestamp: number | null) => void;
}

const useRoundStore = create<RoundStore>((set) => ({
	// State
	currentRound: {
		index: 0,
		completed: false
	},
	roundEndTimeStamp: null,
	
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
		},
		roundEndTimeStamp: null
	})),
	
	resetRound: () => set({
		currentRound: {
			index: 0,
			completed: false
		},
		roundEndTimeStamp: null
	}),
	
	setRoundEndTimeStamp: (timestamp: number | null) => set({
		roundEndTimeStamp: timestamp
	})
}))

export { useRoundStore }