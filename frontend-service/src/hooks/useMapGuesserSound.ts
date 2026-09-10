import { useSound } from 'use-sound';
import { useSoundStore } from '../store/soundStore';
import { SOUND_FILES, SOUND_CONFIG, type SoundType } from '../utils/soundUtils';

const useMapGuesserSound = () => {
	const soundEnabled = useSoundStore((state) => state.soundEnabled);
	const soundVolume = useSoundStore((state) => state.soundVolume);

	const [playCountdown, { stop: stopCountdown }] = useSound(SOUND_FILES.COUNTDOWN, {
		volume: soundVolume * SOUND_CONFIG.COUNTDOWN.volume,
		interrupt: SOUND_CONFIG.COUNTDOWN.interrupt,
	});

	const [playClick] = useSound(SOUND_FILES.CLICK, {
		volume: soundVolume * SOUND_CONFIG.CLICK.volume,
		interrupt: SOUND_CONFIG.CLICK.interrupt,
	});

	const [playTick] = useSound(SOUND_FILES.TICK, {
		volume: soundVolume * SOUND_CONFIG.TICK.volume,
		interrupt: SOUND_CONFIG.TICK.interrupt,
	});

	const playSound = (soundType: SoundType) => {
		if (!soundEnabled) {
			return;
		}

		try {
			switch (soundType) {
				case 'COUNTDOWN':
					playCountdown();
					break;
				case 'CLICK':
					playClick();
					break;
				case 'TICK':
					playTick();
					break;
			}
		} catch (error) {
			console.warn('Could not play sound:', soundType, error);
		}
	};

	const stopSound = (soundType: SoundType) => {
		try {
			switch (soundType) {
				case 'COUNTDOWN':
					stopCountdown();
					break;
				// Only necessary to stop long sounds
			}
		} catch (error) {
			console.warn('Could not stop sound:', soundType, error);
		}
	};

	return { playSound, stopSound, soundEnabled };
};

export { useMapGuesserSound };