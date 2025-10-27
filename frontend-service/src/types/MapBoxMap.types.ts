import type { Round } from "./Game.types";

interface MapboxMapProps {
	roundDetails: Round;
	handleGuess: (distance: number) => void;
	isDisabled: boolean;
}

export type { MapboxMapProps };