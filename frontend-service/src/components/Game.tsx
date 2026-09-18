import React, { useEffect, useCallback } from 'react'
import type { LocationsResponse } from '../types/Game.types'
import { gameStatus } from '../objects/gameStatuses'
import MapboxMap from './MapBoxMap'
import HUD from './HUD'
import GameSetupModal from './game-setup-modal/GameSetupModal'
import EndModal from './EndModal'
import { useFetch } from '../hooks/useFetch'
import { useRoundTimer } from '../hooks/useRoundTimer'
import { buildLocationsApiEndpoint } from '../utils/endpointUtils'
import { useGameStore } from '../store/gameStore'
import { useRoundStore } from '../store/roundStore'
import { notify } from '../context/NotificationContext'
import { MAX_SCORE } from '../objects/gameConsts'
import { useLoading } from '../context/LoadingContext'
import { playUiSound } from '../utils/soundPlayer'
import { playGuessResultSound } from '../utils/guessSoundUtils'

export default function Game() {
	// Get state and actions from stores
	const { 
		rounds, 
		score, 
		status,
		finishGame, 
		updateScore,
		setRounds
	} = useGameStore();
	
	const {
		currentRound,
		roundEndTimeStamp,
		completeRound,
		moveToNextRound
	} = useRoundStore();

	const locationsApiEndpoint = buildLocationsApiEndpoint(5);

	const { data, isPending, error } = useFetch<LocationsResponse>(locationsApiEndpoint);

	const { setLoading } = useLoading();
	
	// Handle initial game data loading
	useEffect(() => {
		if (isPending) {
			setLoading('gameData', true, 'Loading game locations...');
		} else {
			setLoading('gameData', false);
		}
	}, [isPending]);
	
	// Update gameState with rounds when data is fetched
	useEffect(() => {
		if (data?.data && !rounds) {
			setRounds(data.data);
		}
	}, [data]);

	const handleTimeExpired = useCallback(() => {
		if (!currentRound.completed) {
			notify({
				type: 'warning',
				message: "Time's up! Moving to the next round...",
				duration: 5000
			});
			
			playUiSound('TERRIBLE_GUESS');
			updateScore(MAX_SCORE);
			completeRound();
		}
	}, [currentRound.completed]);

	// Custom hook that manages round timer setup and expiration checking
	// Automatically starts timer when round begins and calls handleTimeExpired when time runs out
	useRoundTimer({ handleTimeExpired });

	const handleGuess = (distance: number) => {
		playGuessResultSound(distance, false);
		updateScore(distance);
		completeRound();
	}

	const handleFinishGame = () => {
		playUiSound('APPLAUSE');
		finishGame();
	}

	if (error || (data && data.data.length === 0)) {
		console.error("Failed to fetch locations:", error);
		return (
			<div>Error loading game data. Please try again later.</div>
		)
	}
	
	if (isPending || !rounds) {
		// LoadingOverlay handles loading display
		return null; 
	}

	return (
		<>
			{ status === gameStatus.NOT_STARTED && 
				<GameSetupModal />
			}
			{ status === gameStatus.FINISHED && 
				<EndModal score={score} />
			}
			{/* Ensure the container fills the screen or has a defined height */}
			<div className="relative h-screen"> 
				{status !== gameStatus.NOT_STARTED && (
					<HUD
						gameState={{ rounds, score, status }}
						currentRound={currentRound}
						moveToNextRound={moveToNextRound}
						setGameState={handleFinishGame}
						roundEndTimeStamp={roundEndTimeStamp}
					/>
				)}
				{/* Map container leaving space for MenuBar */}
				<div className="absolute top-0 left-0 right-0 bottom-0 pb-8"> 
					<MapboxMap
						roundDetails={rounds[currentRound.index]}
						handleGuess={handleGuess}
						isDisabled={!rounds?.length || currentRound.completed}
					/>
				</div>
			</div>
		</>
	)
}