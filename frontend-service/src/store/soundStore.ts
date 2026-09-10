import { create } from 'zustand';
import { getSoundPreferences, saveSoundPreferences } from '../services/userPreferences';

interface SoundStore {
	soundEnabled: boolean;
	soundVolume: number;
	toggleSoundEnabled: () => void;
	setSoundVolume: (soundVolume: number) => void;
}

const initialPreferences = getSoundPreferences();

const useSoundStore = create<SoundStore>((set) => ({
	soundEnabled: initialPreferences.soundEnabled,
	soundVolume: initialPreferences.soundVolume,

	toggleSoundEnabled: () => set((state) => {
		const soundEnabled = !state.soundEnabled;
		saveSoundPreferences({ soundEnabled, soundVolume: state.soundVolume });
		return { soundEnabled };
	}),

	setSoundVolume: (soundVolume: number) => set((state) => {
		saveSoundPreferences({ soundEnabled: state.soundEnabled, soundVolume });
		return { soundVolume };
	}),
}));

export { useSoundStore };