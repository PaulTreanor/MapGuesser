import React, { useEffect } from 'react'
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
		completeRound,
		moveToNextRound
	} = useRoundStore();

	const { data, isPending, error } = useFetch<LocationsResponse>(endpoints.locations.random);
	
	// Update gameState when data is fetched
	useEffect(() => {
		if (data?.data && !rounds) {
			setRounds(data.data);
		}
	}, [data, rounds, setRounds]);

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
					/>
				)}
				<div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
					<MapboxMap
						roundDetails={rounds[currentRound.index]}
						handleGuess={handleGuess}
						isDisabled={!rounds?.length}
					/>
				</div>
			</div>
		</>
	)
}