import type { CurrentRound } from './Game.types'

interface TopBarGameProps {
	roundLocation: string
	score: number
	currentRound: CurrentRound
	moveToNextRound: () => void,
	setIsEndModalOpen: (value: boolean) => void,
	isEndModalOpen: boolean
}

export type { TopBarGameProps };