import { useEffect, useCallback } from 'react'
import { gameStatus } from '../objects/gameStatuses'
import { generateRoundEndTimeStamp, isTimerExpired } from '../utils/timerUtils'

interface UseRoundTimerProps {
	handleTimeExpired: () => void
	doesGameHaveTimer: boolean
	status: string
	roundTimeMs: number
	currentRound: { index: number; completed: boolean }
	roundEndTimeStamp: number | null
	setRoundEndTimeStamp: (timestamp: number | null) => void
}

export const useRoundTimer = ({ 
	handleTimeExpired, 
	doesGameHaveTimer, 
	status, 
	roundTimeMs, 
	currentRound, 
	roundEndTimeStamp, 
	setRoundEndTimeStamp 
}: UseRoundTimerProps) => {

	// Set up timer for the round
	useEffect(() => {
		if (doesGameHaveTimer && status === gameStatus.IN_PROGRESS && !currentRound.completed) {
			// Only generate a new timestamp if we don't have one yet
			// This ensures we don't reset the timer when a round is marked as completed
			if (!roundEndTimeStamp) {
				const newEndTimeStamp = generateRoundEndTimeStamp(roundTimeMs)
				setRoundEndTimeStamp(newEndTimeStamp)
			}
		}
	}, [status, currentRound.index, currentRound.completed, roundEndTimeStamp, doesGameHaveTimer, roundTimeMs, setRoundEndTimeStamp])

	// Check if timer expired
	useEffect(() => {
		if (!roundEndTimeStamp || currentRound.completed) return

		const checkTimerInterval = setInterval(() => {
			if (isTimerExpired(roundEndTimeStamp)) {
				handleTimeExpired()
				clearInterval(checkTimerInterval)
			}
		}, 1000)

		return () => clearInterval(checkTimerInterval)
	}, [roundEndTimeStamp, currentRound.completed, handleTimeExpired])
}