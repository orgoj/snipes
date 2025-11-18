import type { GameState, Player, Snipe, Ghost, Hive, Bullet } from './types'
import { EntityType, Direction } from './types'
import { generateMaze, isWalkable, findEmptyPosition } from './mazeGenerator'
import { parseDifficultyLevel } from './difficulty'

export function createInitialGameState(
  width: number,
  height: number,
  difficultyLevel: string = 'A1'
): GameState {
  const difficulty = parseDifficultyLevel(difficultyLevel)
  const maze = generateMaze(width, height)

  const occupiedPositions: { x: number; y: number }[] = []

  // Find player start position
  const playerPos = findEmptyPosition(maze, width, height, occupiedPositions)
  if (!playerPos) throw new Error('Cannot find player position')
  occupiedPositions.push(playerPos)

  const player: Player = {
    id: 'player',
    pos: playerPos,
    type: EntityType.PLAYER,
    lives: difficulty.lives,
    speed: 1,
    boosting: false,
  }

  // Create hives
  const hives: Hive[] = []
  for (let i = 0; i < difficulty.hives; i++) {
    const pos = findEmptyPosition(maze, width, height, occupiedPositions)
    if (!pos) continue
    occupiedPositions.push(pos)

    hives.push({
      id: `hive-${i}`,
      pos,
      type: EntityType.HIVE,
      spawnTimer: 0,
      health: 3,
    })
  }

  return {
    player,
    snipes: [],
    ghosts: [],
    hives,
    bullets: [],
    maze,
    width,
    height,
    difficulty,
    score: 0,
    gameOver: false,
    won: false,
    enemyCount: 0,
  }
}

export function movePlayer(
  state: GameState,
  direction: Direction,
  boosting: boolean = false
): GameState {
  const { player, maze, width, height } = state
  const newPos = getNextPosition(player.pos, direction)

  if (!isWalkable(maze, newPos.x, newPos.y, width, height)) {
    return state
  }

  // Check collision with ghosts
  const hitGhost = state.ghosts.some((g) => g.pos.x === newPos.x && g.pos.y === newPos.y)
  if (hitGhost) {
    return state // Can't move through ghosts
  }

  return {
    ...state,
    player: {
      ...player,
      pos: newPos,
      boosting,
      speed: boosting ? 2 : 1,
    },
  }
}

export function shootBullet(state: GameState, direction: Direction): GameState {
  if (direction === Direction.NONE) return state

  const bullet: Bullet = {
    id: `bullet-${Date.now()}-${Math.random()}`,
    pos: { ...state.player.pos },
    type: EntityType.PLAYER_BULLET,
    dir: direction,
    speed: 2,
    fromPlayer: true,
  }

  return {
    ...state,
    bullets: [...state.bullets, bullet],
  }
}

export function updateGame(state: GameState, deltaTime: number): GameState {
  if (state.gameOver || state.won) return state

  let newState = { ...state }

  // Update hives - spawn snipes
  newState = updateHives(newState, deltaTime)

  // Update snipes - move and shoot
  newState = updateSnipes(newState, deltaTime)

  // Update ghosts - chase player
  newState = updateGhosts(newState, deltaTime)

  // Update bullets
  newState = updateBullets(newState)

  // Check win/lose conditions
  newState = checkGameConditions(newState)

  return newState
}

function updateHives(state: GameState, deltaTime: number): GameState {
  let newState = { ...state }
  const newHives = state.hives.map((hive) => {
    const newTimer = hive.spawnTimer + deltaTime
    if (newTimer >= state.difficulty.hiveSpawnRate && newState.snipes.length < state.difficulty.maxSnipes) {
      // Spawn a snipe
      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ]
      for (const dir of directions) {
        const spawnPos = { x: hive.pos.x + dir.x, y: hive.pos.y + dir.y }
        if (isWalkable(state.maze, spawnPos.x, spawnPos.y, state.width, state.height)) {
          const newSnipe: Snipe = {
            id: `snipe-${Date.now()}-${Math.random()}`,
            pos: spawnPos,
            type: EntityType.SNIPE,
            moveTimer: 0,
            shootTimer: 0,
          }
          newState = {
            ...newState,
            snipes: [...newState.snipes, newSnipe],
            enemyCount: newState.enemyCount + 1,
          }
          return { ...hive, spawnTimer: 0 }
        }
      }
    }
    return { ...hive, spawnTimer: newTimer }
  })

  return { ...newState, hives: newHives }
}

function updateSnipes(state: GameState, deltaTime: number): GameState {
  const moveInterval = 1000 / state.difficulty.snipeSpeed

  const newSnipes = state.snipes.map((snipe) => {
    const newSnipe = { ...snipe, moveTimer: snipe.moveTimer + deltaTime, shootTimer: snipe.shootTimer + deltaTime }

    // Move towards player
    if (newSnipe.moveTimer >= moveInterval) {
      const dx = state.player.pos.x - snipe.pos.x
      const dy = state.player.pos.y - snipe.pos.y

      const newPos = { ...snipe.pos }
      if (Math.abs(dx) > Math.abs(dy)) {
        newPos.x += dx > 0 ? 1 : -1
      } else if (dy !== 0) {
        newPos.y += dy > 0 ? 1 : -1
      }

      if (isWalkable(state.maze, newPos.x, newPos.y, state.width, state.height)) {
        const occupied = state.snipes.some((s) => s.id !== snipe.id && s.pos.x === newPos.x && s.pos.y === newPos.y)
        if (!occupied) {
          newSnipe.pos = newPos
        }
      }
      newSnipe.moveTimer = 0
    }

    // Shoot at player
    if (newSnipe.shootTimer >= state.difficulty.snipeShootRate) {
      const dx = state.player.pos.x - snipe.pos.x
      const dy = state.player.pos.y - snipe.pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 10) {
        // Only shoot if close enough
        const dir = getDirectionTowards(snipe.pos, state.player.pos)
        const bullet: Bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          pos: { ...snipe.pos },
          type: EntityType.BULLET,
          dir,
          speed: 1.5,
          fromPlayer: false,
        }
        state = { ...state, bullets: [...state.bullets, bullet] }
      }
      newSnipe.shootTimer = 0
    }

    return newSnipe
  })

  return { ...state, snipes: newSnipes }
}

function updateGhosts(state: GameState, deltaTime: number): GameState {
  const moveInterval = 500 // Ghosts move slower

  const newGhosts = state.ghosts.map((ghost) => {
    const newGhost = { ...ghost, moveTimer: ghost.moveTimer + deltaTime }

    if (newGhost.moveTimer >= moveInterval) {
      const dx = state.player.pos.x - ghost.pos.x
      const dy = state.player.pos.y - ghost.pos.y

      const newPos = { ...ghost.pos }
      if (Math.abs(dx) > Math.abs(dy)) {
        newPos.x += dx > 0 ? 1 : -1
      } else if (dy !== 0) {
        newPos.y += dy > 0 ? 1 : -1
      }

      // Ghosts can pass through walls
      newGhost.pos = newPos
      newGhost.moveTimer = 0
    }

    return newGhost
  })

  return { ...state, ghosts: newGhosts }
}

function updateBullets(state: GameState): GameState {
  const newBullets: Bullet[] = []
  const newSnipes = [...state.snipes]
  const newGhosts = [...state.ghosts]
  const newHives = [...state.hives]
  const newPlayer = { ...state.player }

  for (const bullet of state.bullets) {
    const newPos = getNextPosition(bullet.pos, bullet.dir)

    // Check if bullet hits wall
    if (!isWalkable(state.maze, newPos.x, newPos.y, state.width, state.height)) {
      continue // Bullet destroyed
    }

    // Check collisions
    if (bullet.fromPlayer) {
      // Player bullet hits snipe
      const hitSnipeIndex = newSnipes.findIndex((s) => s.pos.x === newPos.x && s.pos.y === newPos.y)
      if (hitSnipeIndex !== -1) {
        const snipe = newSnipes[hitSnipeIndex]
        newSnipes.splice(hitSnipeIndex, 1)
        // Create ghost
        const ghost: Ghost = {
          id: `ghost-${Date.now()}-${Math.random()}`,
          pos: { ...snipe.pos },
          type: EntityType.GHOST,
          moveTimer: 0,
        }
        newGhosts.push(ghost)
        continue // Bullet destroyed
      }

      // Player bullet hits hive
      const hitHiveIndex = newHives.findIndex((h) => h.pos.x === newPos.x && h.pos.y === newPos.y)
      if (hitHiveIndex !== -1) {
        newHives[hitHiveIndex].health--
        if (newHives[hitHiveIndex].health <= 0) {
          newHives.splice(hitHiveIndex, 1)
        }
        continue // Bullet destroyed
      }
    } else {
      // Enemy bullet hits player
      if (newPos.x === state.player.pos.x && newPos.y === state.player.pos.y) {
        newPlayer.lives--
        continue // Bullet destroyed
      }
    }

    // Bullet continues
    newBullets.push({ ...bullet, pos: newPos })
  }

  return {
    ...state,
    bullets: newBullets,
    snipes: newSnipes,
    ghosts: newGhosts,
    hives: newHives,
    player: newPlayer,
  }
}

function checkGameConditions(state: GameState): GameState {
  // Check if player died
  if (state.player.lives <= 0) {
    return { ...state, gameOver: true }
  }

  // Check if player collides with ghost
  const hitByGhost = state.ghosts.some((g) => g.pos.x === state.player.pos.x && g.pos.y === state.player.pos.y)
  if (hitByGhost) {
    return { ...state, player: { ...state.player, lives: state.player.lives - 1 } }
  }

  // Check if all hives destroyed and all snipes killed
  if (state.hives.length === 0 && state.snipes.length === 0) {
    return { ...state, won: true }
  }

  return state
}

function getNextPosition(pos: { x: number; y: number }, direction: Direction): { x: number; y: number } {
  const newPos = { ...pos }
  switch (direction) {
    case Direction.UP:
      newPos.y--
      break
    case Direction.DOWN:
      newPos.y++
      break
    case Direction.LEFT:
      newPos.x--
      break
    case Direction.RIGHT:
      newPos.x++
      break
    case Direction.UP_LEFT:
      newPos.y--
      newPos.x--
      break
    case Direction.UP_RIGHT:
      newPos.y--
      newPos.x++
      break
    case Direction.DOWN_LEFT:
      newPos.y++
      newPos.x--
      break
    case Direction.DOWN_RIGHT:
      newPos.y++
      newPos.x++
      break
  }
  return newPos
}

function getDirectionTowards(from: { x: number; y: number }, to: { x: number; y: number }): Direction {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (dx > 0 && dy < 0) return Direction.UP_RIGHT
  if (dx > 0 && dy > 0) return Direction.DOWN_RIGHT
  if (dx < 0 && dy < 0) return Direction.UP_LEFT
  if (dx < 0 && dy > 0) return Direction.DOWN_LEFT
  if (dx > 0) return Direction.RIGHT
  if (dx < 0) return Direction.LEFT
  if (dy > 0) return Direction.DOWN
  if (dy < 0) return Direction.UP

  return Direction.NONE
}
