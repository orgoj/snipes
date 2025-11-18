import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState } from '../game/types'
import { Direction, GameMode } from '../game/types'
import {
  createInitialGameState,
  movePlayer,
  movePlayer2,
  shootBullet,
  shootBulletPlayer2,
  updateGame,
} from '../game/gameEngine'
import { saveSettings, loadSettings, saveHighScore } from '../utils/storage'
import { MultiplayerManager } from '../utils/multiplayerManager'
import Terminal from './Terminal'
import Menu from './Menu'
import './Terminal.css'

type GameScreen = 'menu' | 'playing' | 'paused' | 'gameOver' | 'won' | 'waitingForPlayer'

export default function Game() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [settings, setSettings] = useState(loadSettings())
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false)

  const lastUpdateRef = useRef<number>(0)
  const moveKeysRef = useRef<Set<string>>(new Set())
  const shootKeysRef = useRef<Set<string>>(new Set())
  const player2MoveKeysRef = useRef<Set<string>>(new Set())
  const player2ShootKeysRef = useRef<Set<string>>(new Set())
  const multiplayerManagerRef = useRef<MultiplayerManager | null>(null)

  const startGame = useCallback(
    (difficulty: string) => {
      const newState = createInitialGameState(80, 40, difficulty, GameMode.SOLO)
      setGameState(newState)
      setScreen('playing')
      lastUpdateRef.current = Date.now()
      const newSettings = { ...settings, difficulty }
      setSettings(newSettings)
      saveSettings(newSettings)
    },
    [settings]
  )

  const hostGame = useCallback(
    async (difficulty: string) => {
      try {
        // Create multiplayer manager
        const manager = new MultiplayerManager()
        multiplayerManagerRef.current = manager

        // Host game and get room code
        const code = await manager.hostGame(() => {
          // On connected callback
          console.log('Player 2 connected!')
          setIsWaitingForPlayer(false)
          const newState = createInitialGameState(80, 40, difficulty, GameMode.COOP_HOST)
          setGameState(newState)
          setScreen('playing')
          lastUpdateRef.current = Date.now()
        })

        setRoomCode(code)
        setIsWaitingForPlayer(true)
        setScreen('waitingForPlayer')

        // Setup state sync (host sends state to guest)
        manager.onPlayer2Input((input) => {
          // Handle player 2 input from guest
          setGameState((prev) => {
            if (!prev) return null
            let newState = prev
            if (input.moveDirection !== Direction.NONE) {
              newState = movePlayer2(newState, input.moveDirection, input.boosting)
            }
            if (input.shootDirection !== Direction.NONE) {
              newState = shootBulletPlayer2(newState, input.shootDirection)
            }
            return newState
          })
        })
      } catch (error) {
        console.error('Failed to host game:', error)
        alert('Failed to create game. Please try again.')
      }
    },
    []
  )

  const joinGame = useCallback(
    async (code: string) => {
      try {
        // Create multiplayer manager
        const manager = new MultiplayerManager()
        multiplayerManagerRef.current = manager

        // Join game
        await manager.joinGame(code, () => {
          // On connected callback
          console.log('Connected to host!')
        })

        // Setup state receiving (guest receives state from host)
        manager.onGameStateUpdate((state) => {
          setGameState(state)
          if (screen !== 'playing') {
            setScreen('playing')
          }
        })

        setScreen('playing')
        lastUpdateRef.current = Date.now()
      } catch (error) {
        console.error('Failed to join game:', error)
        alert('Failed to connect. Check the room code and try again.')
      }
    },
    [screen]
  )

  const returnToMenu = useCallback(() => {
    // Cleanup multiplayer connection
    if (multiplayerManagerRef.current) {
      multiplayerManagerRef.current.disconnect()
      multiplayerManagerRef.current = null
    }
    setScreen('menu')
    setGameState(null)
    setRoomCode(null)
    setIsWaitingForPlayer(false)
  }, [])

  // Game loop
  useEffect(() => {
    if (screen !== 'playing' || !gameState) return

    // Initialize timer on first run
    if (lastUpdateRef.current === 0) {
      lastUpdateRef.current = Date.now()
    }

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

        // Host: Send state to guest
        if (newState.gameMode === GameMode.COOP_HOST && multiplayerManagerRef.current) {
          multiplayerManagerRef.current.sendGameState(newState)
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

      // Process Player 2 (if guest or local multiplayer)
      if (gameState.gameMode === GameMode.COOP_GUEST && multiplayerManagerRef.current) {
        // Guest: Send inputs to host
        const p2MoveKeys = Array.from(player2MoveKeysRef.current)
        const p2ShootKeys = Array.from(player2ShootKeysRef.current)
        if (p2MoveKeys.length > 0 || p2ShootKeys.length > 0) {
          const moveDir = p2MoveKeys.length > 0 ? getDirectionFromPlayer2Keys(p2MoveKeys) : Direction.NONE
          const shootDir = p2ShootKeys.length > 0 ? getShootDirectionFromPlayer2Keys(p2ShootKeys) : Direction.NONE
          const boosting = p2MoveKeys.includes('shift')
          multiplayerManagerRef.current.sendPlayerInput(moveDir, shootDir, boosting)
        }
      }
    }, gameState.player.boosting ? 50 : 100) // 2x faster when boosting

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

      // Player 2 movement keys (IJKL)
      if (['i', 'j', 'k', 'l', 'shift'].includes(key)) {
        e.preventDefault()
        player2MoveKeysRef.current.add(key)
      }

      // Player 2 shooting keys (TFGH)
      if (['t', 'f', 'g', 'h'].includes(key)) {
        e.preventDefault()
        player2ShootKeysRef.current.add(key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      moveKeysRef.current.delete(key)
      shootKeysRef.current.delete(key)
      player2MoveKeysRef.current.delete(key)
      player2ShootKeysRef.current.delete(key)
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
      {screen === 'menu' && (
        <Menu
          onStartGame={startGame}
          onHostGame={hostGame}
          onJoinGame={joinGame}
          roomCode={roomCode}
          isWaitingForPlayer={isWaitingForPlayer}
        />
      )}

      {screen === 'waitingForPlayer' && (
        <Menu
          onStartGame={startGame}
          onHostGame={hostGame}
          onJoinGame={joinGame}
          roomCode={roomCode}
          isWaitingForPlayer={isWaitingForPlayer}
        />
      )}

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

function getDirectionFromPlayer2Keys(keys: string[]): Direction {
  const i = keys.includes('i')
  const k = keys.includes('k')
  const j = keys.includes('j')
  const l = keys.includes('l')

  if (i && j) return Direction.UP_LEFT
  if (i && l) return Direction.UP_RIGHT
  if (k && j) return Direction.DOWN_LEFT
  if (k && l) return Direction.DOWN_RIGHT
  if (i) return Direction.UP
  if (k) return Direction.DOWN
  if (j) return Direction.LEFT
  if (l) return Direction.RIGHT

  return Direction.NONE
}

function getShootDirectionFromPlayer2Keys(keys: string[]): Direction {
  const t = keys.includes('t')
  const g = keys.includes('g')
  const f = keys.includes('f')
  const h = keys.includes('h')

  if (t && f) return Direction.UP_LEFT
  if (t && h) return Direction.UP_RIGHT
  if (g && f) return Direction.DOWN_LEFT
  if (g && h) return Direction.DOWN_RIGHT
  if (t) return Direction.UP
  if (g) return Direction.DOWN
  if (f) return Direction.LEFT
  if (h) return Direction.RIGHT

  return Direction.NONE
}
