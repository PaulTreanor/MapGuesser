import React, { useState, useEffect } from 'react'
import { fetchRounds } from '../utils/gameUtils'
import type {Round, CurrentRound} from './types/Game.types'
import MapboxMap from './MapBoxMap'
import TopBarGame from './TopBarGame'
import StartModal from './StartModal'
import EndModal from './EndModal'
import { numberOfRoundsInGame, indexOfFinalRound } from '../objects/gameConsts'

export default function Game() {
	const [currentRound, setCurrentRound] = useState<CurrentRound>({
		index: 0,
		completed: false
	});
	const [rounds, setRounds] = useState<Round[] | null>(null)
	const [score, setScore] = useState<number>(0)
	const [isStartModalOpen, setIsStartModalOpen] = useState(true); 
	const [isEndModalOpen, setIsEndModalOpen] = useState(false);

	const handleGuess = (distance: number) => {
		setScore(score + distance)
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
		setRounds(initialGameRounds)
	}, [])

	if (!rounds) {
		return (
			<div>Loading...</div>
		)
	}

	if (currentRound.index === numberOfRoundsInGame && currentRound.completed) {
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
						roundLocation={rounds[currentRound.index].location}
						score={score}
						currentRound={currentRound}
						moveToNextRound={moveToNextRound}
						setIsEndModalOpen={setIsEndModalOpen}
						isEndModalOpen={isEndModalOpen}
					/>
				)}
				<div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
					<MapboxMap
						roundDetails={rounds[currentRound.index]}
						handleGuess={handleGuess}
					/>
				</div>
			</div>
		</>
	)
}
