import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateRoundEndTimeStamp, isTimerExpired } from '../../utils/timerUtils'

describe('Timer Utilities', () => {
  beforeEach(() => {
    // Mock Date.now to return a consistent value
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2023, 1, 1, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('generateRoundEndTimeStamp', () => {
    it('should generate a timestamp in the future', () => {
      const now = Date.now()
      const duration = 30000 // 30 seconds
      const endTime = generateRoundEndTimeStamp(duration)
      
      expect(endTime).toBe(now + duration)
    })
  })

  describe('isTimerExpired', () => {
    it('should return false for a future timestamp', () => {
      const futureTime = Date.now() + 30000
      expect(isTimerExpired(futureTime)).toBe(false)
    })

    it('should return true for a past timestamp', () => {
      const pastTime = Date.now() - 5000
      expect(isTimerExpired(pastTime)).toBe(true)
    })

    it('should return false for null timestamp', () => {
      expect(isTimerExpired(null)).toBe(false)
    })
  })
})