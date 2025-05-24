import { describe, it, expect } from 'vitest'
import { hexToRgb, interpolateColor } from '../../utils/colorUtils'

describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    it('converts hex colors to RGB objects', () => {
      // Test with hash prefix
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      
      // Test without hash prefix
      expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      
      // Test with mixed values
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })
  })

  describe('interpolateColor', () => {
    it('interpolates between two colors correctly', () => {
      // Interpolate from red to green at different factors
      
      // At factor 0, should be the first color
      expect(interpolateColor('#ff0000', '#00ff00', 0)).toBe('#ff0000')
      
      // At factor 1, should be the second color
      expect(interpolateColor('#ff0000', '#00ff00', 1)).toBe('#00ff00')
      
      // At factor 0.5, should be halfway between
      // Should be approx #808000 (or #7f7f00 depending on rounding)
      const midColor = interpolateColor('#ff0000', '#00ff00', 0.5)
      expect(midColor.toLowerCase()).toBe('#808000')
      
      // Test with other colors - black to white
      expect(interpolateColor('#000000', '#ffffff', 0.5).toLowerCase()).toBe('#808080')
    })

    it('handles out of range factors', () => {
      // Factor < 0 should clamp to first color
      const firstColor = interpolateColor('#ff0000', '#00ff00', -0.5)
      expect(firstColor.toLowerCase()).toBe('#ff0000')
      
      // Factor > 1 should clamp to second color
      const secondColor = interpolateColor('#ff0000', '#00ff00', 1.5)
      expect(secondColor.toLowerCase()).toBe('#00ff00')
    })
  })
})