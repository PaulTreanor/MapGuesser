/**
 * Utility functions for managing game timers
 */

/**
 * Generate a timestamp for when a round should end
 * @param roundDurationMs Duration of the round in milliseconds
 * @returns Timestamp (milliseconds since epoch) when the round should end
 */
export const generateRoundEndTimeStamp = (roundDurationMs: number): number => {
	return Date.now() + roundDurationMs;
};

/**
 * Check if a timer has expired
 * @param endTimeStamp The timestamp when the timer should end
 * @returns True if the current time is past the end timestamp
 */
export const isTimerExpired = (endTimeStamp: number | null): boolean => {
	if (!endTimeStamp) return false;
	return Date.now() >= endTimeStamp;
};