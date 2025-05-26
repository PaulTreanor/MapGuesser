import { useSound } from 'use-sound';
import { getSoundPreferences } from '../services/userPreferences';
import { SOUND_FILES, SOUND_CONFIG } from '../utils/soundUtils';

const useMapGuesserSound = () => {
	const soundPreferences = getSoundPreferences();

	// Pre-load all sounds with their configurations
	const [playTick, { stop: stopTick }] = useSound(SOUND_FILES.TICK, {
		volume: soundPreferences.soundVolume * SOUND_CONFIG.TICK.volume,
		interrupt: SOUND_CONFIG.TICK.interrupt,
		sprite: {
			countdown: [0, 3000], // First 3 seconds for countdown
		},
	});

	const [playClick] = useSound(SOUND_FILES.CLICK, {
		volume: soundPreferences.soundVolume * SOUND_CONFIG.CLICK.volume,
		interrupt: SOUND_CONFIG.CLICK.interrupt,
	});
	

	const [playFail] = useSound(SOUND_FILES.FAIL, {
		volume: soundPreferences.soundVolume * SOUND_CONFIG.FAIL.volume,
		interrupt: SOUND_CONFIG.FAIL.interrupt,
	});

	const playSound = (soundType: 'TICK' | 'CLICK' | 'FAIL', options?: { id?: string }) => {
		// Don't play if sound is disabled
		if (!soundPreferences.soundEnabled) {
			return;
		}

		try {
			switch (soundType) {
				case 'TICK':
					playTick(options);
					break;
				case 'CLICK':
					playClick(options);
					break;
				case 'FAIL':
					playFail(options);
					break;
			}
		} catch (error) {
			console.warn('Could not play sound:', soundType, error);
		}
	};

	const stopSound = (soundType: 'TICK' | 'CLICK' | 'FAIL') => {
		try {
			switch (soundType) {
				case 'TICK':
					stopTick();
					break;
				// Click and fail sounds are short, no need to stop them
			}
		} catch (error) {
			console.warn('Could not stop sound:', soundType, error);
		}
	};

	return { playSound, stopSound, soundEnabled: soundPreferences.soundEnabled };
};

export { useMapGuesserSound };