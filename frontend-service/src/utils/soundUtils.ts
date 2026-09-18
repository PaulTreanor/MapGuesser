import tickingCountdownSound from '../sounds/ticking-countdown.mp3';
import buttonClickSound from '../sounds/button-click.mp3';
import pingSound from '../sounds/ping.mp3';

const SOUND_FILES = {
	COUNTDOWN: tickingCountdownSound,
	CLICK: buttonClickSound,
	TICK: buttonClickSound,
	PING: pingSound,
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
	PING: {
		volume: 0.6,
		interrupt: false,
	},
} as const;

export { SOUND_FILES, SOUND_CONFIG, type SoundType };