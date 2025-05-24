import { getItem, setItem } from './storageService';

// Namespace for all user preferences to avoid collisions
const STORAGE_PREFIX = 'mapguesser_';

// Storage keys
export const STORAGE_KEYS = {
	ROUND_TIMER_INDEX: `${STORAGE_PREFIX}round_timer_index`,
	ROUND_TIMER_MS: `${STORAGE_PREFIX}round_timer_ms`,
	HAS_TIMER: `${STORAGE_PREFIX}has_timer`,
};

// Timer preferences
interface TimerPreferences {
	roundTimerIndex: number;
	roundTimeMs: number;
	hasTimer: boolean;
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