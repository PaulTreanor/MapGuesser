import { useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { useRoundStore } from '../store/roundStore'
import { gameStatus } from '../objects/gameStatuses'
import { generateRoundEndTimeStamp, isTimerExpired } from '../utils/timerUtils'

interface UseRoundTimerProps {
	handleTimeExpired: () => void
}

export const useRoundTimer = ({ handleTimeExpired }: UseRoundTimerProps) => {
	const { doesGameHaveTimer, status, roundTimeMs } = useGameStore()
	const { currentRound, roundEndTimeStamp, setRoundEndTimeStamp } = useRoundStore()

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