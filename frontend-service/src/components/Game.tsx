import React, { useState, useEffect } from 'react'
import { fetchRounds } from '../utils/gameUtils'
import type { CurrentRound, GameState } from './types/Game.types'
import { gameStatus } from '../objects/gameStatuses'
import MapboxMap from './MapBoxMap'
import TopBarGame from './TopBarGame'
import StartModal from './StartModal'
import EndModal from './EndModal'
import { indexOfFinalRound } from '../objects/gameConsts'

export default function Game() {
	const [currentRound, setCurrentRound] = useState<CurrentRound>({
		index: 0,
		completed: false
	});
	const [gameState, setGameState] = useState<GameState>({
		rounds: null,
		score: 0,
		status: gameStatus.NOT_STARTED
	});

	const handleGuess = (distance: number) => {
		setGameState(prev => ({
			...prev,
			score: prev.score + distance
		}))
		setCurrentRound(prev => ({
			...prev,
			completed: true
		}))
	}

	const moveToNextRound = () => {
		if (currentRound.index === indexOfFinalRound) {
			return
		}
		setCurrentRound({
			index: currentRound.index + 1,
			completed: false
		})
	}

	useEffect(() => {
		const initialGameRounds = fetchRounds()
		setGameState(prev => ({
			...prev,
			rounds: initialGameRounds
		}))
	}, [])

	if (!gameState.rounds) {
		return (
			<div>Loading...</div>
		)
	}

	return (
		<>
			{ gameState.status === gameStatus.NOT_STARTED && 
				<StartModal setGameState={setGameState} />
			}
			{ gameState.status === gameStatus.FINISHED && 
				<EndModal score={gameState.score} />
			}
			<div className="relative h-screen"> {/* Ensure the container fills the screen or has a defined height */}
				{gameState.status !== gameStatus.NOT_STARTED && (
					<TopBarGame
						gameState={gameState}
						currentRound={currentRound}
						moveToNextRound={moveToNextRound}
						setGameState={setGameState}
					/>
				)}
				<div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
					<MapboxMap
						roundDetails={gameState.rounds[currentRound.index]}
						handleGuess={handleGuess}
					/>
				</div>
			</div>
		</>
	)
}
