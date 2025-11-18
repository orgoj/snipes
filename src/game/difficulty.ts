import type { DifficultyConfig } from './types'

// Difficulty levels from A1 (easiest) to Z9 (hardest)
export function parseDifficultyLevel(level: string): DifficultyConfig {
  const letter = level.charAt(0).toUpperCase()
  const number = parseInt(level.charAt(1))

  if (letter < 'A' || letter > 'Z' || isNaN(number) || number < 1 || number > 9) {
    // Return default directly to avoid circular dependency
    return {
      level: 'A1',
      hives: 3,
      maxSnipes: 10,
      lives: 5,
      snipeSpeed: 1,
      snipeShootRate: 1000,
      hiveSpawnRate: 3000,
      electricWalls: false,
      reflectingBullets: false,
    }
  }

  const letterIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0) // 0-25
  const numberIndex = number - 1 // 0-8

  // Calculate difficulty parameters based on letter (0-25) and number (0-8)
  const combinedDifficulty = letterIndex * 9 + numberIndex // 0-233

  const hives = Math.floor(3 + (combinedDifficulty / 233) * 7) // 3-10
  const maxSnipes = Math.floor(10 + (combinedDifficulty / 233) * 140) // 10-150
  const lives = 5 - Math.floor((combinedDifficulty / 233) * 3) // 5-2
  const snipeSpeed = 1 + (combinedDifficulty / 233) * 2 // 1-3
  const snipeShootRate = 1000 - (combinedDifficulty / 233) * 500 // 1000-500ms
  const hiveSpawnRate = 3000 - (combinedDifficulty / 233) * 1500 // 3000-1500ms
  const electricWalls = combinedDifficulty > 150
  const reflectingBullets = combinedDifficulty > 180

  return {
    level,
    hives,
    maxSnipes,
    lives,
    snipeSpeed,
    snipeShootRate,
    hiveSpawnRate,
    electricWalls,
    reflectingBullets,
  }
}

export function getDefaultDifficulty(): DifficultyConfig {
  return parseDifficultyLevel('A1')
}

export function getAllDifficultyLevels(): string[] {
  const levels: string[] = []
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode('A'.charCodeAt(0) + i)
    for (let num = 1; num <= 9; num++) {
      levels.push(`${letter}${num}`)
    }
  }
  return levels
}
