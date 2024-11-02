type Pin = [number, number]

type Round = {
	location: string;
	coordinates: Pin;
}

interface CurrentRound {
	index: number;
	completed: boolean;
}

export type { Round, CurrentRound, Pin };