import React, { useState, useEffect } from 'react'
import { Progress } from './ui/colorfulProgress'
import { useProgressTimer } from '../hooks/useProgressTimer'
import { colors } from '../objects/colours'

interface CountDownProgressBarProps {
	progressBarFullTimeStamp: number,
	className?: string,
	isPaused?: boolean
	isLockedIn?: boolean
}

const CountDownProgressBar = ({
	progressBarFullTimeStamp,
	className,
	isPaused = false,
	isLockedIn = false
}: CountDownProgressBarProps) => {
	const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null)
	
	// Manages timer progress, color, and pulse state
	const { progress, color, shouldPulse } = useProgressTimer({
		progressBarFullTimeStamp,
		isPaused
	})

	// Once the player has locked in their guess, settle into a calm blue
	const displayColor = isLockedIn ? colors.blue : color;
	const displayPulse = isLockedIn ? false : shouldPulse;
	
	// When the isPaused prop changes, store the current time remaining
	useEffect(() => {
		if (isPaused && pausedTimeRemaining === null) {
			setPausedTimeRemaining(progressBarFullTimeStamp - Date.now());
		} else if (!isPaused) {
			setPausedTimeRemaining(null);
		}
	}, [isPaused, progressBarFullTimeStamp, pausedTimeRemaining]);
	

	// If paused, render the timer with the frozen state
	if (isPaused && pausedTimeRemaining !== null) {		
		return (
			<Progress
				value={progress}
				color={displayColor}
				backgroundColor={displayColor}
				pulse={false}
				className={className}
			/>
		);
	}

	return (
		<Progress
			value={progress}
			color={displayColor}
			backgroundColor={displayColor}
			pulse={displayPulse}
			className={className}
			style={{ transition: 'all 0.2s ease-in-out' }}
		/>
	);
};

export default CountDownProgressBar