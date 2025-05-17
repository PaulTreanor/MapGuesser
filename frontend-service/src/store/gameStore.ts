import { create } from 'zustand'
import { gameStatus } from '../objects/gameStatuses'
import type { GameStatus, Round } from '../components/types/Game.types'

interface GameStore {
	// Game state
	status: GameStatus;
	score: number;
	rounds: Round[] | null;
	
	// Actions
	startGame: () => void;
	finishGame: () => void;
	updateScore: (points: number) => void;
	setRounds: (rounds: Round[]) => void;
	resetGame: () => void;
}

const useGameStore = create<GameStore>((set) => ({
	// State
	status: gameStatus.NOT_STARTED,
	score: 0,
	rounds: null,
	
	// Actions
	startGame: () => set({ status: gameStatus.IN_PROGRESS }),
	
	finishGame: () => set({ status: gameStatus.FINISHED }),
	
	updateScore: (points: number) => set((state) => ({
		score: state.score + points
	})),
	
	setRounds: (rounds: Round[]) => set({ rounds }),
	
	resetGame: () => set({
		score: 0,
		status: gameStatus.NOT_STARTED,
		rounds: null
	})
}))

export { useGameStore }