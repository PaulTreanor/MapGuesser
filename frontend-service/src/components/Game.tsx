import React, { useEffect, useCallback } from 'react'
import type { LocationsResponse } from './types/Game.types'
import { gameStatus } from '../objects/gameStatuses'
import MapboxMap from './MapBoxMap'
import HUD from './HUD'
import StartModal from './StartModal'
import EndModal from './EndModal'
import { useFetch } from '../hooks/useFetch'
import { useRoundTimer } from '../hooks/useRoundTimer'
import { endpoints } from '../objects/endpoints'
import { useGameStore } from '../store/gameStore'
import { useRoundStore } from '../store/roundStore'
import { notify } from '../context/NotificationContext'
import { MAX_SCORE } from '../objects/gameConsts'
import { useLoading } from '../context/LoadingContext'

export default function Game() {
	// Get state and actions from stores
	const { 
		rounds, 
		score, 
		status,
		startGame,
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

	const { data, isPending, error } = useFetch<LocationsResponse>(endpoints.locations.random);

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
			
			handleGuess(MAX_SCORE);
		}
	}, [currentRound.completed]);

	// Custom hook that manages round timer setup and expiration checking
	// Automatically starts timer when round begins and calls handleTimeExpired when time runs out
	useRoundTimer({ handleTimeExpired });

	const handleGuess = (distance: number) => {
		updateScore(distance);
		completeRound();
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
				<StartModal setGameState={startGame} />
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
						setGameState={finishGame}
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