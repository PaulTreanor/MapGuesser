import React, { useState, useEffect } from 'react'
import { fetchRounds } from '../utils/gameUtils'
import type {Round } from './types/Game.types'
import MapboxMap from './MapBoxMap'
import TopBarGame from './TopBarGame'
import StartModal from './StartModal'
import EndModal from './EndModal'


export default function Game() {
	const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
	const [rounds, setRounds] = useState<Round[] | null>(null)
	const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
	const [score, setScore] = useState<number>(0)
	const [isStartModalOpen, setIsStartModalOpen] = useState(true); 
	const [isEndModalOpen, setIsEndModalOpen] = useState(false);

	const handleGuess = (distance: number) => {
		setScore(score + distance)
		setRoundCompleted(true)
	}

	const moveToNextRound = () => {
		setRoundCompleted(false)
		if (currentRoundIndex === 4) {
			return
		}
		setCurrentRoundIndex(currentRoundIndex + 1)
	}

	useEffect(() => {
		const initialGameRounds = fetchRounds()
		setRounds(initialGameRounds)
	}, [])

	if (!rounds) {
		return (
			<div>Loading...</div>
		)
	}

	if (currentRoundIndex === 5 && roundCompleted) {
		return (
			<div>Game Over</div>
		)
	}

	return (
		<>
			{ isStartModalOpen && 
				<StartModal setIsStartModalOpen={setIsStartModalOpen} />
			}
			{ isEndModalOpen && 
				<EndModal score={score} />
			}
			<div className="relative h-screen"> {/* Ensure the container fills the screen or has a defined height */}
				{!isStartModalOpen && (
					<TopBarGame
						roundLocation={rounds[currentRoundIndex].location}
						score={score}
						currentRound={currentRoundIndex + 1}
						roundCompleted={roundCompleted}
						moveToNextRound={moveToNextRound}
						setIsEndModalOpen={setIsEndModalOpen}
						isEndModalOpen={isEndModalOpen}
					/>
				)}
				<div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
	
					<MapboxMap
						roundDetails={rounds[currentRoundIndex]}
						handleGuess={handleGuess}
					/>
				</div>
			</div>
		</>
	)
}
