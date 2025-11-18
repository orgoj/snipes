import { describe, it, expect } from 'vitest'
import { parseDifficultyLevel, getDefaultDifficulty, getAllDifficultyLevels } from './difficulty'

describe('Difficulty System', () => {
  describe('parseDifficultyLevel', () => {
    it('parses A1 as easiest difficulty', () => {
      const config = parseDifficultyLevel('A1')
      expect(config.level).toBe('A1')
      expect(config.lives).toBe(5)
      expect(config.hives).toBe(3)
    })

    it('parses Z9 as hardest difficulty', () => {
      const config = parseDifficultyLevel('Z9')
      expect(config.level).toBe('Z9')
      expect(config.lives).toBe(2)
      expect(config.maxSnipes).toBeGreaterThan(100)
    })

    it('increases difficulty from A1 to B1', () => {
      const a1 = parseDifficultyLevel('A1')
      const b1 = parseDifficultyLevel('B1')
      expect(b1.maxSnipes).toBeGreaterThan(a1.maxSnipes)
      expect(b1.snipeSpeed).toBeGreaterThan(a1.snipeSpeed)
    })

    it('handles lowercase letters', () => {
      const config = parseDifficultyLevel('a1')
      expect(config.level).toBe('a1')
      expect(config.lives).toBeDefined()
    })

    it('returns default for invalid input', () => {
      const invalid = parseDifficultyLevel('ZZ')
      const defaultConfig = getDefaultDifficulty()
      expect(invalid).toEqual(defaultConfig)
    })
  })

  describe('getAllDifficultyLevels', () => {
    it('returns all 234 difficulty levels', () => {
      const levels = getAllDifficultyLevels()
      expect(levels).toHaveLength(234) // 26 letters * 9 numbers
    })

    it('starts with A1', () => {
      const levels = getAllDifficultyLevels()
      expect(levels[0]).toBe('A1')
    })

    it('ends with Z9', () => {
      const levels = getAllDifficultyLevels()
      expect(levels[levels.length - 1]).toBe('Z9')
    })

    it('includes M5 in the middle', () => {
      const levels = getAllDifficultyLevels()
      expect(levels).toContain('M5')
    })
  })

  describe('getDefaultDifficulty', () => {
    it('returns A1 configuration', () => {
      const config = getDefaultDifficulty()
      expect(config.level).toBe('A1')
      expect(config.lives).toBe(5)
    })
  })
})
