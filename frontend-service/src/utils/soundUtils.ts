import tickingCountdownSound from '../sounds/ticking-countdown.mp3';
import buttonClickSound from '../sounds/button-click.mp3';
import pingSound from '../sounds/ping.mp3';
import yeahBoySound from '../sounds/yeah-boy.mp3';
import tromboneFailSound from '../sounds/trombone-fail.mp3';
import applauseSound from '../sounds/applause.mp3';

const SOUND_FILES = {
	COUNTDOWN: tickingCountdownSound,
	CLICK: buttonClickSound,
	TICK: buttonClickSound,
	PING: pingSound,
	PERFECT_GUESS: yeahBoySound,
	TERRIBLE_GUESS: tromboneFailSound,
	APPLAUSE: applauseSound,
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
	PERFECT_GUESS: {
		volume: 0.5,
		interrupt: false,
	},
	TERRIBLE_GUESS: {
		volume: 0.4,
		interrupt: false,
	},
	APPLAUSE: {
		volume: 0.3,
		interrupt: false,
	},
} as const;

export { SOUND_FILES, SOUND_CONFIG, type SoundType };