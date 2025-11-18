import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState } from '../game/types'
import { Direction } from '../game/types'
import { createInitialGameState, movePlayer, shootBullet, updateGame } from '../game/gameEngine'
import { saveSettings, loadSettings, saveHighScore } from '../utils/storage'
import Terminal from './Terminal'
import Menu from './Menu'
import './Terminal.css'

type GameScreen = 'menu' | 'playing' | 'paused' | 'gameOver' | 'won'

export default function Game() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [settings, setSettings] = useState(loadSettings())
  const lastUpdateRef = useRef<number>(Date.now())
  const moveKeysRef = useRef<Set<string>>(new Set())
  const shootKeysRef = useRef<Set<string>>(new Set())

  const startGame = useCallback((difficulty: string) => {
    const newState = createInitialGameState(80, 40, difficulty)
    setGameState(newState)
    setScreen('playing')
    lastUpdateRef.current = Date.now()
    const newSettings = { ...settings, difficulty }
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [settings])

  const returnToMenu = useCallback(() => {
    setScreen('menu')
    setGameState(null)
  }, [])

  // Game loop
  useEffect(() => {
    if (screen !== 'playing' || !gameState) return

    const interval = setInterval(() => {
      const now = Date.now()
      const deltaTime = now - lastUpdateRef.current
      lastUpdateRef.current = now

      setGameState((prevState) => {
        if (!prevState) return null
        const newState = updateGame(prevState, deltaTime)

        if (newState.gameOver) {
          setScreen('gameOver')
        } else if (newState.won) {
          setScreen('won')
          saveHighScore({
            difficulty: newState.difficulty.level,
            timestamp: Date.now(),
          })
        }

        return newState
      })
    }, 50) // ~20 FPS game loop

    return () => clearInterval(interval)
  }, [screen, gameState])

  // Handle player movement and shooting
  useEffect(() => {
    if (screen !== 'playing' || !gameState) return

    const moveInterval = setInterval(() => {
      // Process movement
      const moveKeys = Array.from(moveKeysRef.current)
      if (moveKeys.length > 0) {
        const direction = getDirectionFromKeys(moveKeys)
        const boosting = moveKeys.includes(' ')
        setGameState((prev) => (prev ? movePlayer(prev, direction, boosting) : null))
      }

      // Process shooting
      const shootKeys = Array.from(shootKeysRef.current)
      if (shootKeys.length > 0) {
        const direction = getShootDirectionFromKeys(shootKeys)
        setGameState((prev) => (prev ? shootBullet(prev, direction) : null))
      }
    }, 100) // Movement/shooting at 10 FPS

    return () => clearInterval(moveInterval)
  }, [screen, gameState])

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (screen === 'playing') {
          setScreen('paused')
        } else if (screen === 'paused') {
          setScreen('playing')
        } else if (screen === 'gameOver' || screen === 'won') {
          returnToMenu()
        }
        return
      }

      if (screen !== 'playing') return

      const key = e.key.toLowerCase()

      // Movement keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault()
        moveKeysRef.current.add(key)
      }

      // Shooting keys
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault()
        shootKeysRef.current.add(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      moveKeysRef.current.delete(key)
      shootKeysRef.current.delete(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [screen, returnToMenu])

  return (
    <div className="terminal-container">
      {screen === 'menu' && <Menu onStartGame={startGame} />}

      {screen === 'playing' && gameState && <Terminal gameState={gameState} colorScheme={settings.colorScheme} />}

      {screen === 'paused' && (
        <div className="menu">
          <h2 style={{ textAlign: 'center' }}>PAUSED</h2>
          <div className="menu-options">
            <button className="menu-button" onClick={() => setScreen('playing')}>
              RESUME
            </button>
            <button className="menu-button" onClick={returnToMenu}>
              QUIT TO MENU
            </button>
          </div>
        </div>
      )}

      {screen === 'gameOver' && (
        <div className="menu game-over-screen">
          <h2>GAME OVER</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>You were destroyed!</p>
          <div className="menu-options">
            <button className="menu-button" onClick={() => gameState && startGame(gameState.difficulty.level)}>
              TRY AGAIN
            </button>
            <button className="menu-button" onClick={returnToMenu}>
              MENU
            </button>
          </div>
        </div>
      )}

      {screen === 'won' && (
        <div className="menu win-screen">
          <h2>VICTORY!</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>All hives destroyed!</p>
          {gameState && (
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>Level: {gameState.difficulty.level}</p>
          )}
          <div className="menu-options">
            <button className="menu-button" onClick={() => gameState && startGame(gameState.difficulty.level)}>
              PLAY AGAIN
            </button>
            <button className="menu-button" onClick={returnToMenu}>
              MENU
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getDirectionFromKeys(keys: string[]): Direction {
  const up = keys.includes('arrowup')
  const down = keys.includes('arrowdown')
  const left = keys.includes('arrowleft')
  const right = keys.includes('arrowright')

  if (up && left) return Direction.UP_LEFT
  if (up && right) return Direction.UP_RIGHT
  if (down && left) return Direction.DOWN_LEFT
  if (down && right) return Direction.DOWN_RIGHT
  if (up) return Direction.UP
  if (down) return Direction.DOWN
  if (left) return Direction.LEFT
  if (right) return Direction.RIGHT

  return Direction.NONE
}

function getShootDirectionFromKeys(keys: string[]): Direction {
  const w = keys.includes('w')
  const s = keys.includes('s')
  const a = keys.includes('a')
  const d = keys.includes('d')

  if (w && a) return Direction.UP_LEFT
  if (w && d) return Direction.UP_RIGHT
  if (s && a) return Direction.DOWN_LEFT
  if (s && d) return Direction.DOWN_RIGHT
  if (w) return Direction.UP
  if (s) return Direction.DOWN
  if (a) return Direction.LEFT
  if (d) return Direction.RIGHT

  return Direction.NONE
}
