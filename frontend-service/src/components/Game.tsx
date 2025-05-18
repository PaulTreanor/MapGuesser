import React, { useEffect, useCallback } from 'react'
import type { LocationsResponse } from './types/Game.types'
import { gameStatus } from '../objects/gameStatuses'
import MapboxMap from './MapBoxMap'
import HUD from './HUD'
import StartModal from './StartModal'
import EndModal from './EndModal'
import { useFetch } from '../hooks/useFetch'
import { endpoints } from '../objects/endpoints'
import { useGameStore } from '../store/gameStore'
import { useRoundStore } from '../store/roundStore'
import { notify } from '../context/NotificationContext'
import { generateRoundEndTimeStamp, isTimerExpired } from '../utils/timerUtils'
import { MAX_SCORE } from '../objects/gameConsts'

export default function Game() {
	// Get state and actions from stores
	const { 
		doesGameHaveTimer,
		rounds, 
		score, 
		status,
		roundTimeMs,
		startGame,
		finishGame, 
		updateScore,
		setRounds
	} = useGameStore();
	
	const {
		currentRound,
		roundEndTimeStamp,
		completeRound,
		moveToNextRound,
		setRoundEndTimeStamp
	} = useRoundStore();

	const { data, isPending, error } = useFetch<LocationsResponse>(endpoints.locations.random);
	
	// Update gameState when data is fetched
	useEffect(() => {
		if (data?.data && !rounds) {
			setRounds(data.data);
		}
	}, [data, rounds, setRounds]);

	const handleTimeExpired = useCallback(() => {
		if (!currentRound.completed) {
			notify({
				type: 'warning',
				message: "Time's up! Moving to the next round...",
				duration: 5000
			});
			
			updateScore(MAX_SCORE);
			completeRound();
		}
	}, [currentRound.completed, completeRound, updateScore]);

	// Set up timer for the round
	useEffect(() => {
		if (doesGameHaveTimer && status === gameStatus.IN_PROGRESS && !currentRound.completed) {
			// Only generate a new timestamp if we don't have one yet
			// This ensures we don't reset the timer when a round is marked as completed
			if (!roundEndTimeStamp) {
				const newEndTimeStamp = generateRoundEndTimeStamp(roundTimeMs);
				setRoundEndTimeStamp(newEndTimeStamp);
			}
		}
	}, [status, currentRound.index, currentRound.completed, roundEndTimeStamp, setRoundEndTimeStamp]);

	// Check if timer expired
	useEffect(() => {
		if (!roundEndTimeStamp || currentRound.completed) return;

		const checkTimerInterval = setInterval(() => {
			if (isTimerExpired(roundEndTimeStamp)) {
				handleTimeExpired();
				clearInterval(checkTimerInterval);
			}
		}, 1000);

		return () => clearInterval(checkTimerInterval);
	}, [roundEndTimeStamp, currentRound.completed, handleTimeExpired]);

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
		return (
			<div>Loading...</div>
		)
	}

	return (
		<>
			{ status === gameStatus.NOT_STARTED && 
				<StartModal setGameState={startGame} />
			}
			{ status === gameStatus.FINISHED && 
				<EndModal score={score} />
			}
			<div className="relative h-screen"> {/* Ensure the container fills the screen or has a defined height */}
				{status !== gameStatus.NOT_STARTED && (
					<HUD
						gameState={{ rounds, score, status }}
						currentRound={currentRound}
						moveToNextRound={moveToNextRound}
						setGameState={finishGame}
						roundEndTimeStamp={roundEndTimeStamp}
					/>
				)}
				<div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
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