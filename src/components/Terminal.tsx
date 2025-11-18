import type { GameState } from '../game/types'
import { EntityType } from '../game/types'
import './Terminal.css'

interface TerminalProps {
  gameState: GameState | null
  colorScheme?: 'green' | 'amber' | 'white'
}

export default function Terminal({ gameState, colorScheme = 'green' }: TerminalProps) {
  if (!gameState) {
    return null
  }

  const screen = renderGameState(gameState)

  return (
    <div className="terminal">
      <div className={`screen ${colorScheme}`}>{screen}</div>
      <div className="hud">
        <div className="hud-item">
          <span>SCORE:</span>
          <span>{gameState.score}</span>
        </div>
        <div className="hud-item">
          <span>LIVES:</span>
          <span>{'♥'.repeat(gameState.player.lives)}</span>
        </div>
        <div className="hud-item">
          <span>LEVEL:</span>
          <span>{gameState.difficulty.level}</span>
        </div>
        <div className="hud-item">
          <span>HIVES:</span>
          <span>{gameState.hives.length}</span>
        </div>
        <div className="hud-item">
          <span>SNIPES:</span>
          <span>{gameState.snipes.length}</span>
        </div>
        <div className="hud-item">
          <span>GHOSTS:</span>
          <span>{gameState.ghosts.length}</span>
        </div>
      </div>
    </div>
  )
}

function renderGameState(state: GameState): string {
  const grid: string[][] = state.maze.map((row) => row.map((cell) => cell as string))

  // Place hives
  for (const hive of state.hives) {
    grid[hive.pos.y][hive.pos.x] = EntityType.HIVE
  }

  // Place snipes
  for (const snipe of state.snipes) {
    grid[snipe.pos.y][snipe.pos.x] = EntityType.SNIPE
  }

  // Place ghosts
  for (const ghost of state.ghosts) {
    grid[ghost.pos.y][ghost.pos.x] = EntityType.GHOST
  }

  // Place bullets
  for (const bullet of state.bullets) {
    grid[bullet.pos.y][bullet.pos.x] = bullet.type
  }

  // Place player (on top)
  grid[state.player.pos.y][state.player.pos.x] = EntityType.PLAYER

  // Place player 2 (if multiplayer)
  if (state.player2) {
    grid[state.player2.pos.y][state.player2.pos.x] = EntityType.PLAYER2
  }

  return grid.map((row) => row.join('')).join('\n')
}
