interface GameSettings {
  difficulty: string
  colorScheme: 'green' | 'amber' | 'white' | 'vga'
}

interface HighScore {
  difficulty: string
  timestamp: number
}

const SETTINGS_KEY = 'snipes-settings'
const HIGHSCORES_KEY = 'snipes-highscores'

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export function loadSettings(): GameSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return {
    difficulty: 'A1',
    colorScheme: 'green',
  }
}

export function saveHighScore(score: HighScore): void {
  try {
    const scores = loadHighScores()
    scores.push(score)
    // Keep only last 10 scores
    const sortedScores = scores.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(sortedScores))
  } catch (e) {
    console.error('Failed to save high score:', e)
  }
}

export function loadHighScores(): HighScore[] {
  try {
    const data = localStorage.getItem(HIGHSCORES_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load high scores:', e)
  }
  return []
}
