import React, { useState, useEffect } from 'react'
import { Progress } from './ui/colorfulProgress'
import { colors } from '../objects/colours'
import { timerStyleMap, ColorStop } from '../objects/timerStyles'
import { interpolateColor } from '../utils/colorUtils'

interface CountDownProgressBarProps {
	progressBarFullTimeStamp: number,
	className?: string
}

const CountDownProgressBar = ({
	progressBarFullTimeStamp,
	className
}: CountDownProgressBarProps) => {
	const [progress, setProgress] = useState(0)
	const [color, setColor] = useState(colors.sky)
	const [shouldPulse, setShouldPulse] = useState(false)

    // useState instead of const so startTime doesn't get reset on rerenders
	const [startTime] = useState(Date.now())
	
	// Calculate color based on time remaining with smooth interpolation
	const calculateColor = (seconds: number): string => {
		// Find the current and next color stops
		let currentStop: ColorStop | null = null
		let nextStop: ColorStop | null = null
		
		for (let i = 0; i < timerStyleMap.length; i++) {
			if (seconds <= timerStyleMap[i].threshold) {
				currentStop = timerStyleMap[i]
				nextStop = i > 0 ? timerStyleMap[i - 1] : currentStop
				break
			}
		}
		
		if (!currentStop) {
			return colors.sky // Fallback
		}
		
		if (currentStop === nextStop || !nextStop) {
			return currentStop.color
		}
		
		// Calculate interpolation factor
		const range = currentStop.threshold - nextStop.threshold
		const position = seconds - nextStop.threshold
		const factor = Math.max(0, Math.min(1, position / range))
		
		// Interpolate between colors
		return interpolateColor(nextStop.color, currentStop.color, factor)
	}
	
	// Calculate if pulse should be active based on time remaining
	const calculatePulse = (seconds: number): boolean => {
		for (const { threshold, pulse } of timerStyleMap) {
			if (seconds <= threshold) {
				return pulse
			}
		}
		return false
	}
	
	useEffect(() => {
		// Update progress every 50ms for smooth animation
		const interval = setInterval(() => {
			const now = Date.now()
			const totalDuration = progressBarFullTimeStamp - now

			if (totalDuration <= 0) {
				// Timer is complete
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
			setShouldPulse(calculatePulse(remainingSeconds))
		}, 50)

		return () => clearInterval(interval)
	}, [progressBarFullTimeStamp, startTime])

	return (
		<Progress
			value={progress}
			color={color}
			backgroundColor={color}
			pulse={shouldPulse}
			className={className}
			style={{ transition: 'all 0.2s ease-in-out' }}
		/>
	)
}

export default CountDownProgressBar