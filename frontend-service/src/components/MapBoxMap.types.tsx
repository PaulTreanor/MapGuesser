import type { Round } from "../Types";

interface MapboxMapProps {
	roundDetails: Round;
	handleGuess: (distance: number) => void;
}

export type { MapboxMapProps };