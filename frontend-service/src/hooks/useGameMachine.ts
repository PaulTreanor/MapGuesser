import { useMachine } from '@xstate/react'
import { gameMachine } from '../machines/gameMachine'
import type { Round } from '../components/types/Game.types'

export const useGameMachine = () => {
	const [state, send] = useMachine(gameMachine)
	
	const { context } = state
	
	// Computed values
	const currentRound = {
		index: context.currentRoundIndex,
		completed: context.roundCompleted,
	}
	
	// Game actions (matching gameStore interface)
	const startGame = () => send({ type: 'START_GAME' })
	const finishGame = () => send({ type: 'FINISH_GAME' })
	const resetGame = () => send({ type: 'RESET_GAME' })
	const setRounds = (rounds: Round[]) => send({ type: 'LOAD_ROUNDS', rounds })
	const updateScore = (points: number) => {
		send({ type: 'COMPLETE_ROUND', score: points })
	}
	const setDoesGameHaveTimer = (hasTimer: boolean) => 
		send({ type: 'SET_TIMER_CONFIG', hasTimer, timeMs: context.roundTimeMs })
	const setRoundTimeMs = (timeMs: number) => 
		send({ type: 'SET_TIMER_CONFIG', hasTimer: context.doesGameHaveTimer, timeMs })
	
	// Round actions (matching roundStore interface)
	const completeRound = () => send({ type: 'COMPLETE_ROUND', score: 0 })
	const moveToNextRound = () => send({ type: 'NEXT_ROUND' })
	const setRoundEndTimeStamp = (timestamp: number | null) => 
		send({ type: 'SET_ROUND_END_TIME', timestamp })
	
	// Timer-specific actions
	const handleTimeExpired = (score: number) => send({ type: 'TIME_EXPIRED', score })
	
	return {
		// Game state (matching gameStore)
		doesGameHaveTimer: context.doesGameHaveTimer,
		status: context.status,
		score: context.score,
		rounds: context.rounds,
		roundTimeMs: context.roundTimeMs,
		
		// Round state (matching roundStore)
		currentRound,
		roundEndTimeStamp: context.roundEndTimeStamp,
		
		// Actions
		startGame,
		finishGame,
		resetGame,
		setRounds,
		updateScore,
		setDoesGameHaveTimer,
		setRoundTimeMs,
		completeRound,
		moveToNextRound,
		setRoundEndTimeStamp,
		handleTimeExpired,
		
		// XState specific
		state,
		send,
	}
}