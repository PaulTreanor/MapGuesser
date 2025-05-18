/**
 * Utility functions for color manipulation and interpolation
 */

/**
 * Convert a hex color string to an RGB object
 */
export const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
	// Remove # if present
	hex = hex.replace(/^#/, '')
	
	// Parse hex
	const bigint = parseInt(hex, 16)
	const r = (bigint >> 16) & 255
	const g = (bigint >> 8) & 255
	const b = bigint & 255
	
	return { r, g, b }
}

/**
 * Interpolate between two hex colors based on a factor (0-1)
 * @param color1 The starting color (hex)
 * @param color2 The ending color (hex)
 * @param factor The interpolation factor (0 = color1, 1 = color2)
 * @returns Interpolated color as a hex string
 */
export const interpolateColor = (color1: string, color2: string, factor: number): string => {
	// Clamp the factor to a 0-1 range
	const clampedFactor = Math.max(0, Math.min(1, factor))
	
	// Quick edge cases for improved performance
	if (clampedFactor === 0) return color1
	if (clampedFactor === 1) return color2
	
	// Convert hex to rgb
	const rgb1 = hexToRgb(color1)
	const rgb2 = hexToRgb(color2)
	
	// Interpolate
	const r = Math.round(rgb1.r + clampedFactor * (rgb2.r - rgb1.r))
	const g = Math.round(rgb1.g + clampedFactor * (rgb2.g - rgb1.g))
	const b = Math.round(rgb1.b + clampedFactor * (rgb2.b - rgb1.b))
	
	// Convert back to hex
	return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}