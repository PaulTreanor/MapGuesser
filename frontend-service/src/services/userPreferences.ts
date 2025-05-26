import { getItem, setItem } from './storageService';

// Namespace for all user preferences to avoid collisions
const STORAGE_PREFIX = 'mapguesser_';

// Storage keys
export const STORAGE_KEYS = {
	ROUND_TIMER_INDEX: `${STORAGE_PREFIX}round_timer_index`,
	ROUND_TIMER_MS: `${STORAGE_PREFIX}round_timer_ms`,
	HAS_TIMER: `${STORAGE_PREFIX}has_timer`,
	SOUND_ENABLED: `${STORAGE_PREFIX}sound_enabled`,
	SOUND_VOLUME: `${STORAGE_PREFIX}sound_volume`,
};

// Timer preferences
interface TimerPreferences {
	roundTimerIndex: number;
	roundTimeMs: number;
	hasTimer: boolean;
}

// Sound preferences
interface SoundPreferences {
	soundEnabled: boolean;
	soundVolume: number;
}

/**
 * Get the user's timer preferences
 * @returns TimerPreferences object with default values if not found
 */
export const getTimerPreferences = (): TimerPreferences => {
	return {
		roundTimerIndex: getItem<number>(STORAGE_KEYS.ROUND_TIMER_INDEX, 5), // Default to "No timer" (index 5)
		roundTimeMs: getItem<number>(STORAGE_KEYS.ROUND_TIMER_MS, 0), // Default to 0 (no timer)
		hasTimer: getItem<boolean>(STORAGE_KEYS.HAS_TIMER, false), // Default to false (no timer)
	};
};

/**
 * Save the user's timer preferences
 * @param preferences TimerPreferences object
 * @returns boolean success indicator
 */
export const saveTimerPreferences = (preferences: TimerPreferences): boolean => {
	const { roundTimerIndex, roundTimeMs, hasTimer } = preferences;
	
	const results = [
		setItem(STORAGE_KEYS.ROUND_TIMER_INDEX, roundTimerIndex),
		setItem(STORAGE_KEYS.ROUND_TIMER_MS, roundTimeMs),
		setItem(STORAGE_KEYS.HAS_TIMER, hasTimer),
	];
	
	// Return true only if all operations succeeded
	return results.every(result => result === true);
};

/**
 * Get the user's sound preferences
 * @returns SoundPreferences object with default values if not found
 */
export const getSoundPreferences = (): SoundPreferences => {
	return {
		soundEnabled: getItem<boolean>(STORAGE_KEYS.SOUND_ENABLED, true), // Default to enabled
		soundVolume: getItem<number>(STORAGE_KEYS.SOUND_VOLUME, 0.7), // Default to 70% volume
	};
};

/**
 * Save the user's sound preferences
 * @param preferences SoundPreferences object
 * @returns boolean success indicator
 */
export const saveSoundPreferences = (preferences: SoundPreferences): boolean => {
	const { soundEnabled, soundVolume } = preferences;
	
	const results = [
		setItem(STORAGE_KEYS.SOUND_ENABLED, soundEnabled),
		setItem(STORAGE_KEYS.SOUND_VOLUME, soundVolume),
	];
	
	// Return true only if all operations succeeded
	return results.every(result => result === true);
};