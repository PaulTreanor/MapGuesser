import React, { useEffect, useCallback } from 'react'
import type { LocationsResponse } from './types/Game.types'
import { gameStatus } from '../objects/gameStatuses'
import MapboxMap from './MapBoxMap'
import HUD from './HUD'
import StartModal from './StartModal'
import EndModal from './EndModal'
import { useFetch } from '../hooks/useFetch'
import { useRoundTimer } from '../hooks/useRoundTimer'
import { useGameMachine } from '../hooks/useGameMachine'
import { endpoints } from '../objects/endpoints'
import { notify } from '../context/NotificationContext'
import { MAX_SCORE } from '../objects/gameConsts'

export default function Game() {
	// Get state and actions from state machine
	const {
		// Game state
		rounds,
		score,
		status,
		doesGameHaveTimer,
		roundTimeMs,
		// Round state
		currentRound,
		roundEndTimeStamp,
		// Actions
		startGame,
		finishGame,
		updateScore,
		setRounds,
		moveToNextRound,
		setRoundEndTimeStamp,
		setDoesGameHaveTimer,
		setRoundTimeMs,
		handleTimeExpired: machineHandleTimeExpired
	} = useGameMachine();

	const { data, isPending, error } = useFetch<LocationsResponse>(endpoints.locations.random);
	
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
			
			machineHandleTimeExpired(MAX_SCORE);
		}
	}, [currentRound.completed, machineHandleTimeExpired]);

	// Custom hook that manages round timer setup and expiration checking
	// Automatically starts timer when round begins and calls handleTimeExpired when time runs out
	useRoundTimer({ 
		handleTimeExpired,
		doesGameHaveTimer,
		status,
		roundTimeMs,
		currentRound,
		roundEndTimeStamp,
		setRoundEndTimeStamp
	});

	const handleGuess = (distance: number) => {
		updateScore(distance);
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
				<StartModal 
					setGameState={startGame} 
					setDoesGameHaveTimer={setDoesGameHaveTimer}
					setRoundTimeMs={setRoundTimeMs}
				/>
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