import { useState, useEffect } from 'react'
import { colors } from '../objects/colours'
import { timerStyleMap } from '../objects/timerStyles'
import { isShouldUsePulse, calculateColor } from '../utils/countDownProgressBarUtils'

interface UseProgressTimerProps {
	progressBarFullTimeStamp: number
	isPaused: boolean
}

interface UseProgressTimerReturn {
	progress: number
	color: string
	shouldPulse: boolean
}

export const useProgressTimer = ({ 
	progressBarFullTimeStamp, 
	isPaused 
}: UseProgressTimerProps): UseProgressTimerReturn => {
	const [progress, setProgress] = useState(0)
	const [color, setColor] = useState(colors.sky)
	const [shouldPulse, setShouldPulse] = useState(false)
	
	// useState instead of const so startTime doesn't get reset on rerenders
	const [startTime] = useState(Date.now())

	useEffect(() => {
		// Don't run the timer if paused
		if (isPaused) return

		// Update progress every 50ms for smooth animation
		const interval = setInterval(() => {
			const now = Date.now()
			const totalDuration = progressBarFullTimeStamp - now

			if (totalDuration <= 0) {
				setProgress(100)
				setColor(timerStyleMap[0].color)
				setShouldPulse(timerStyleMap[0].pulse)
				clearInterval(interval)
				return
			}

			// Calculate progress (0-100)
			const remainingSeconds = totalDuration / 1000
			const totalOriginalDuration = progressBarFullTimeStamp - startTime
			const elapsedDuration = now - startTime
			const currentProgress = Math.min(100, (elapsedDuration / totalOriginalDuration) * 100)
			
			setProgress(currentProgress)
			setColor(calculateColor(remainingSeconds))
			setShouldPulse(isShouldUsePulse(remainingSeconds))
		}, 50)

		return () => clearInterval(interval)
	}, [progressBarFullTimeStamp, startTime, isPaused])

	return { progress, color, shouldPulse }
}