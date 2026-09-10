import { useRef, useEffect } from 'react';
import { useMapGuesserSound } from './useMapGuesserSound';

interface UseTimerCountdownSoundProps {
	remainingSeconds: number;
	isPaused: boolean;
}

const COUNTDOWN_THRESHOLD_SECONDS = 3;

const useTimerCountdownSound = ({ remainingSeconds, isPaused }: UseTimerCountdownSoundProps) => {
	const hasPlayedRef = useRef(false);
	const { playSound, stopSound, soundEnabled } = useMapGuesserSound();

	useEffect(() => {
		// Stop the sound and reset when the round completes or the timer is paused
		if (isPaused || remainingSeconds <= 0) {
			stopSound('COUNTDOWN');
			hasPlayedRef.current = false;
			return;
		}

		// Reset when the timer is restarted with plenty of time left
		if (remainingSeconds > COUNTDOWN_THRESHOLD_SECONDS) {
			hasPlayedRef.current = false;
			return;
		}

		// Play the countdown once when we hit the final seconds
		if (soundEnabled && !hasPlayedRef.current) {
			playSound('COUNTDOWN');
			hasPlayedRef.current = true;
		}
	}, [remainingSeconds, isPaused, soundEnabled, playSound, stopSound]);
};

export { useTimerCountdownSound };