interface TopBarGameProps {
	roundLocation: string
	score: number
	currentRound: number
	roundCompleted: boolean
	moveToNextRound: () => void,
	setIsEndModalOpen: (value: boolean) => void,
	isEndModalOpen: boolean
}

export type { TopBarGameProps };