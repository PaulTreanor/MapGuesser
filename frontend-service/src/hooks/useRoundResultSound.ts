import { useEffect, useRef } from 'react';
import { calculateKm } from '../utils/mapUtils';
import { playGuessResultSound } from '../utils/guessSoundUtils';
import type { GameContext } from '../types/MultiplayerServiceApiResponse.types';

type UseRoundResultSoundProps = {
	gameContext: GameContext | null;
	currentRoundIndex: number;
	currentPlayerId: string;
};

const useRoundResultSound = ({ gameContext, currentRoundIndex, currentPlayerId }: UseRoundResultSoundProps) => {
	const playedRoundIndexRef = useRef<number | null>(null);

	useEffect(() => {
		if (gameContext?.gameStateMachinePhase !== 'showRoundResult') {
			return;
		}

		if (playedRoundIndexRef.current === currentRoundIndex) {
			return;
		}

		const currentRound = gameContext.rounds[currentRoundIndex];
		if (!currentRound) {
			return;
		}

		const myGuess = currentRound.playerGuesses.find(
			(guess) => guess.playerId === currentPlayerId
		);
		if (!myGuess) {
			return;
		}

		const timedOut = myGuess.timedOut ?? false;
		const distance = myGuess.guessCoordinates
			? calculateKm(myGuess.guessCoordinates, currentRound.location.coordinates)
			: null;

		playGuessResultSound(distance, timedOut);
		playedRoundIndexRef.current = currentRoundIndex;
	}, [gameContext?.gameStateMachinePhase, currentRoundIndex, currentPlayerId]);
};

export { useRoundResultSound };