import tickingCountdownSound from '../sounds/ticking-countdown.mp3';
import normalUiClickSound from '../sounds/click.mp3'

// Sound file mappings
const SOUND_FILES = {
	TICK: tickingCountdownSound,
	CLICK: normalUiClickSound,
	FAIL: normalUiClickSound,
} as const;

type SoundType = keyof typeof SOUND_FILES;

// Sound configuration
const SOUND_CONFIG = {
	TICK: {
		volume: 0.1,
		interrupt: false, 
	},
	CLICK: {
		volume: 1.0,
		interrupt: false,
	},
	FAIL: {
		volume: 1.0,
		interrupt: true,
	},
} as const;

export { SOUND_FILES, SOUND_CONFIG, type SoundType };