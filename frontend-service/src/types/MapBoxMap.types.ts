import type { Round, Pin } from "./Game.types";
import type { Player, PlayerGuess } from "./MultiplayerServiceApiResponse.types";

type MultiplayerResultsData = {
	playerGuesses: PlayerGuess[];
	players: Player[];
	actualLocation: Pin;
};

interface MapboxMapProps {
	roundDetails: Round;
	handleGuess: (distance: number, guessCoordinates?: Pin) => void;
	isDisabled: boolean;
	multiplayerResults?: MultiplayerResultsData;
}

export type { MapboxMapProps, MultiplayerResultsData };