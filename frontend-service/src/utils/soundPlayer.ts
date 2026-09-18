import { SOUND_FILES, SOUND_CONFIG, type SoundType } from './soundUtils';
import { useSoundStore } from '../store/soundStore';

const audioElements: Partial<Record<SoundType, HTMLAudioElement>> = {};

const getAudioElement = (soundType: SoundType): HTMLAudioElement => {
	let audio = audioElements[soundType];
	if (!audio) {
		audio = new Audio(SOUND_FILES[soundType]);
		audio.preload = 'auto';
		audioElements[soundType] = audio;
	}
	return audio;
};

const playUiSound = (soundType: SoundType) => {
	const { soundEnabled, soundVolume } = useSoundStore.getState();
	if (!soundEnabled) {
		return;
	}

	try {
		const audio = getAudioElement(soundType);
		const config = SOUND_CONFIG[soundType];
		audio.volume = soundVolume * config.volume;

		if (config.interrupt || audio.paused) {
			audio.currentTime = 0;
			const playResult = audio.play();
			if (playResult !== undefined) {
				playResult.catch((error: unknown) => {
					console.warn('Could not play sound:', soundType, error);
				});
			}
		}
	} catch (error) {
		console.warn('Could not play sound:', soundType, error);
	}
};

const stopUiSound = (soundType: SoundType) => {
	try {
		const audio = audioElements[soundType];
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
	} catch (error) {
		console.warn('Could not stop sound:', soundType, error);
	}
};

export { playUiSound, stopUiSound };