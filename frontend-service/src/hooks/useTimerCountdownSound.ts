import { useRef, useEffect } from 'react';
import { useMapGuesserSound } from './useMapGuesserSound';

interface UseTimerCountdownSoundProps {
	remainingSeconds: number;
	isPaused: boolean;
	isRoundCompleted: boolean;
}

const useTimerCountdownSound = ({ remainingSeconds, isPaused, isRoundCompleted }: UseTimerCountdownSoundProps) => {
	const hasPlayedRef = useRef(false);
	const { playSound, stopSound, soundEnabled } = useMapGuesserSound();

	useEffect(() => {
		// Stop sound and reset when round completes
		if (isRoundCompleted) {
			stopSound('TICK');
			hasPlayedRef.current = false;
			return;
		}
		
		// Reset when timer starts fresh
		if (remainingSeconds > 3) {
			hasPlayedRef.current = false;
		}
		
		// Play countdown when we hit 3 seconds remaining
		if (
			soundEnabled &&
			!isPaused &&
			!isRoundCompleted &&
			remainingSeconds <= 3 &&
			remainingSeconds > 0 &&
			!hasPlayedRef.current
		) {
			playSound('TICK', { id: 'countdown' });
			hasPlayedRef.current = true;
		}
	}, [remainingSeconds, isPaused, isRoundCompleted, soundEnabled, playSound, stopSound]);
};

export { useTimerCountdownSound };