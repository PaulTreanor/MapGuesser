import type { CurrentRound, GameState } from './Game.types'

// properly type this
interface TopBarGameProps {
	gameState: GameState
	currentRound: CurrentRound
	moveToNextRound: () => void,
	setGameState: (value: any) => void,
}

export type { TopBarGameProps };