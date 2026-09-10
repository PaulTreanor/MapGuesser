import tickingCountdownSound from '../sounds/ticking-countdown.mp3';
import clickSound from '../sounds/click.mp3';

const SOUND_FILES = {
	COUNTDOWN: tickingCountdownSound,
	CLICK: clickSound,
	TICK: clickSound,
} as const;

type SoundType = keyof typeof SOUND_FILES;

const SOUND_CONFIG = {
	COUNTDOWN: {
		volume: 0.2,
		interrupt: false,
	},
	CLICK: {
		volume: 0.8,
		interrupt: false,
	},
	TICK: {
		volume: 0.4,
		interrupt: true,
	},
} as const;

export { SOUND_FILES, SOUND_CONFIG, type SoundType };