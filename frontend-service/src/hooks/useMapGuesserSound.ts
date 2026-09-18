import { useSoundStore } from '../store/soundStore';
import { playUiSound, stopUiSound } from '../utils/soundPlayer';
import type { SoundType } from '../utils/soundUtils';

const useMapGuesserSound = () => {
	const soundEnabled = useSoundStore((state) => state.soundEnabled);

	const playSound = (soundType: SoundType) => {
		playUiSound(soundType);
	};

	const stopSound = (soundType: SoundType) => {
		stopUiSound(soundType);
	};

	return { playSound, stopSound, soundEnabled };
};

export { useMapGuesserSound };