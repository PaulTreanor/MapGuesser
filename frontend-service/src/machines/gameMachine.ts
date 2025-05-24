import { createMachine, assign } from 'xstate'
import { gameStatus } from '../objects/gameStatuses'
import type { GameStatus, Round } from '../components/types/Game.types'
import { numberOfRoundsInGame } from '../objects/gameConsts'

export interface GameContext {
	// Game state
	doesGameHaveTimer: boolean
	status: GameStatus
	score: number
	rounds: Round[] | null
	roundTimeMs: number
	
	// Round state
	currentRoundIndex: number
	roundCompleted: boolean
	roundEndTimeStamp: number | null
}

export type GameEvent =
	| { type: 'START_GAME' }
	| { type: 'LOAD_ROUNDS'; rounds: Round[] }
	| { type: 'COMPLETE_ROUND'; score: number }
	| { type: 'NEXT_ROUND' }
	| { type: 'FINISH_GAME' }
	| { type: 'RESET_GAME' }
	| { type: 'SET_TIMER_CONFIG'; hasTimer: boolean; timeMs: number }
	| { type: 'SET_ROUND_END_TIME'; timestamp: number | null }
	| { type: 'TIME_EXPIRED'; score: number }

export const gameMachine = createMachine<GameContext, GameEvent>({
	id: 'game',
	initial: 'notStarted',
	context: {
		doesGameHaveTimer: false,
		status: gameStatus.NOT_STARTED,
		score: 0,
		rounds: null,
		roundTimeMs: 15000,
		currentRoundIndex: 0,
		roundCompleted: false,
		roundEndTimeStamp: null,
	},
	states: {
		notStarted: {
			on: {
				LOAD_ROUNDS: {
					actions: assign({
						rounds: (_, event) => event.rounds,
					}),
				},
				START_GAME: {
					target: 'playingRound',
					actions: assign({
						status: gameStatus.IN_PROGRESS,
					}),
				},
				SET_TIMER_CONFIG: {
					actions: assign({
						doesGameHaveTimer: (_, event) => event.hasTimer,
						roundTimeMs: (_, event) => event.timeMs,
					}),
				},
			},
		},
		
		playingRound: {
			initial: 'active',
			states: {
				active: {
					on: {
						COMPLETE_ROUND: {
							target: 'completed',
							actions: assign({
								score: (context, event) => context.score + event.score,
								roundCompleted: true,
							}),
						},
						TIME_EXPIRED: {
							target: 'completed', 
							actions: assign({
								score: (context, event) => context.score + event.score,
								roundCompleted: true,
							}),
						},
						SET_ROUND_END_TIME: {
							actions: assign({
								roundEndTimeStamp: (_, event) => event.timestamp,
							}),
						},
					},
				},
				
				completed: {
					on: {
						NEXT_ROUND: [
							{
								target: '#game.finished',
								cond: (context) => context.currentRoundIndex >= numberOfRoundsInGame - 1,
								actions: assign({
									status: gameStatus.FINISHED,
								}),
							},
							{
								target: 'active',
								actions: assign({
									currentRoundIndex: (context) => context.currentRoundIndex + 1,
									roundCompleted: false,
									roundEndTimeStamp: null,
								}),
							},
						],
					},
				},
			},
			
			on: {
				RESET_GAME: {
					target: 'notStarted',
					actions: assign({
						score: 0,
						status: gameStatus.NOT_STARTED,
						rounds: null,
						currentRoundIndex: 0,
						roundCompleted: false,
						roundEndTimeStamp: null,
					}),
				},
			},
		},
		
		finished: {
			on: {
				RESET_GAME: {
					target: 'notStarted',
					actions: assign({
						score: 0,
						status: gameStatus.NOT_STARTED,
						rounds: null,
						currentRoundIndex: 0,
						roundCompleted: false,
						roundEndTimeStamp: null,
					}),
				},
			},
		},
	},
})