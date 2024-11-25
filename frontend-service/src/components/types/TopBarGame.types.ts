import type { CurrentRound, GameState } from './Game.types'

interface TopBarGameProps {
	gameState: GameState
	currentRound: CurrentRound
	moveToNextRound: () => void,
	setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export type { TopBarGameProps };