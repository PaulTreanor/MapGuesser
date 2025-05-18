import { create } from 'zustand'
import { gameStatus } from '../objects/gameStatuses'
import type { GameStatus, Round } from '../components/types/Game.types'

interface GameStore {
	// Game state
	doesGameHaveTimer: boolean;
	status: GameStatus;
	score: number;
	rounds: Round[] | null;
	roundTimeMs: number;
	
	// Actions
	startGame: () => void;
	finishGame: () => void;
	updateScore: (points: number) => void;
	setRounds: (rounds: Round[]) => void;
	resetGame: () => void;
	setDoesGameHaveTimer: (doesGameHaveTimer: boolean) => void;
	setRoundTimeMs: (roundTimeMs: number) => void;
}

const useGameStore = create<GameStore>((set) => ({
	// State
	doesGameHaveTimer: false,
	status: gameStatus.NOT_STARTED,
	score: 0,
	rounds: null,
	roundTimeMs: 15000,
	
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
	}),

	setDoesGameHaveTimer: (doesGameHaveTimer: boolean) => set({ doesGameHaveTimer }),

	setRoundTimeMs: (roundTimeMs: number) => set({ roundTimeMs }),
}))

export { useGameStore }