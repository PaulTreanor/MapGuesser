import React, { useState, useEffect } from 'react'
import { Progress } from './ui/colorfulProgress'
import { useProgressTimer } from '../hooks/useProgressTimer'

interface CountDownProgressBarProps {
	progressBarFullTimeStamp: number,
	className?: string,
	isPaused?: boolean,
	isRoundCompleted?: boolean
}

const CountDownProgressBar = ({
	progressBarFullTimeStamp,
	className,
	isPaused = false,
	isRoundCompleted = false
}: CountDownProgressBarProps) => {
	const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null)
	
	// Manages timer progress, color, and pulse state
	const { progress, color, shouldPulse } = useProgressTimer({
		progressBarFullTimeStamp,
		isPaused,
		isRoundCompleted
	})
	
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
				color={color}
				backgroundColor={color}
				pulse={false}
				className={className}
			/>
		);
	}

	return (
		<Progress
			value={progress}
			color={color}
			backgroundColor={color}
			pulse={shouldPulse}
			className={className}
			style={{ transition: 'all 0.2s ease-in-out' }}
		/>
	);
};

export default CountDownProgressBar