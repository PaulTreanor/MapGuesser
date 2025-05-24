/**
 * Configuration for the countdown timer's appearance at different time thresholds
 */

import { colors } from './colours'

export interface ColorStop {
	threshold: number  // Time threshold in seconds
	color: string      // Color to display at this threshold
	pulse: boolean     // Whether to show pulse effect
}

/**
 * Defines how the timer should appear at different remaining time thresholds
 * The color and pulse effect will be applied when the remaining time is less than or equal to the threshold
 */
export const timerStyleMap: ColorStop[] = [
	{ threshold: 2, color: colors.red, pulse: true },
	{ threshold: 4, color: colors.rose, pulse: true },
	{ threshold: 6, color: colors.pink, pulse: false },
	{ threshold: 9, color: colors.fuchsia, pulse: false },
	{ threshold: 12, color: colors.purple, pulse: false },
	{ threshold: 16, color: colors.violet, pulse: false },
	{ threshold: 20, color: colors.indigo, pulse: false },
	{ threshold: 25, color: colors.blue, pulse: false },
	{ threshold: Infinity, color: colors.sky, pulse: false }
]