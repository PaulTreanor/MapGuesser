import { timerStyleMap, ColorStop } from '../objects/timerStyles'
import { colors } from '../objects/colours'
import { interpolateColor } from '../utils/colorUtils'

const isShouldUsePulse = (seconds: number): boolean => {
    for (const { threshold, pulse } of timerStyleMap) {
        if (seconds <= threshold) {
            return pulse
        }
    }
    return false
}

// Calculate color based on time remaining with smooth interpolation
const calculateColor = (seconds: number): string => {
    // Find the current and next color stops
    const foundIndex = timerStyleMap.findIndex(({ threshold }) => seconds <= threshold)
    const currentStop: ColorStop | null = foundIndex !== -1 ? timerStyleMap[foundIndex] : null
    const nextStop: ColorStop | null = foundIndex > 0 ? timerStyleMap[foundIndex - 1] : currentStop
    
    if (!currentStop) {
        return colors.sky // Fallback
    }
    
    if (currentStop === nextStop || !nextStop) {
        return currentStop.color
    }
    
    // Calculate interpolation factor
    const range = currentStop.threshold - nextStop.threshold
    const position = seconds - nextStop.threshold
    const factor = Math.max(0, Math.min(1, position / range))
    
    // Interpolate between colors
    return interpolateColor(nextStop.color, currentStop.color, factor)
}

export { isShouldUsePulse, calculateColor }