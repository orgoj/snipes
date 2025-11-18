import { EntityType } from './types'

export function generateMaze(width: number, height: number, seed?: number): EntityType[][] {
  const maze: EntityType[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(EntityType.EMPTY))

  // Create border walls
  for (let y = 0; y < height; y++) {
    maze[y][0] = EntityType.WALL
    maze[y][width - 1] = EntityType.WALL
  }
  for (let x = 0; x < width; x++) {
    maze[0][x] = EntityType.WALL
    maze[height - 1][x] = EntityType.WALL
  }

  // Simple pseudo-random number generator (if seed provided)
  const rng = seed !== undefined ? seededRandom(seed) : Math.random

  // Add random interior walls (corridors style)
  const wallDensity = 0.15
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      if (rng() < wallDensity) {
        // Create small wall clusters
        maze[y][x] = EntityType.WALL
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]
        const dir = directions[Math.floor(rng() * directions.length)]
        const nx = x + dir[0]
        const ny = y + dir[1]
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
          maze[ny][nx] = EntityType.WALL
        }
      }
    }
  }

  // Add some random scattered walls
  const scatteredWalls = Math.floor((width * height) / 40)
  for (let i = 0; i < scatteredWalls; i++) {
    const x = Math.floor(rng() * (width - 2)) + 1
    const y = Math.floor(rng() * (height - 2)) + 1
    maze[y][x] = EntityType.WALL
  }

  return maze
}

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

export function isWalkable(
  maze: EntityType[][],
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  if (x < 0 || x >= width || y < 0 || y >= height) return false
  return maze[y][x] !== EntityType.WALL
}

export function findEmptyPosition(
  maze: EntityType[][],
  width: number,
  height: number,
  occupiedPositions: { x: number; y: number }[]
): { x: number; y: number } | null {
  const maxAttempts = 100
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * (width - 2)) + 1
    const y = Math.floor(Math.random() * (height - 2)) + 1

    if (maze[y][x] === EntityType.EMPTY) {
      const occupied = occupiedPositions.some((pos) => pos.x === x && pos.y === y)
      if (!occupied) {
        return { x, y }
      }
    }
  }
  return null
}
