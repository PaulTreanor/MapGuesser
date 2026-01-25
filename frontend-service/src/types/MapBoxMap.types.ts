import type { Round, Pin } from "./Game.types";

interface MapboxMapProps {
	roundDetails: Round;
	handleGuess: (distance: number, guessCoordinates?: Pin) => void;
	isDisabled: boolean;
}

export type { MapboxMapProps };