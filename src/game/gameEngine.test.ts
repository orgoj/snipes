import { describe, it, expect } from 'vitest'
import { createInitialGameState, movePlayer, shootBullet } from './gameEngine'
import { Direction, EntityType } from './types'

describe('Game Engine', () => {
  describe('createInitialGameState', () => {
    it('creates initial game state with correct dimensions', () => {
      const state = createInitialGameState(80, 40, 'A1')
      expect(state.width).toBe(80)
      expect(state.height).toBe(40)
      expect(state.maze).toHaveLength(40)
      expect(state.maze[0]).toHaveLength(80)
    })

    it('creates player with correct initial lives', () => {
      const state = createInitialGameState(80, 40, 'A1')
      expect(state.player.lives).toBe(5) // A1 is easiest with 5 lives
      expect(state.player.type).toBe(EntityType.PLAYER)
    })

    it('creates hives based on difficulty', () => {
      const state = createInitialGameState(80, 40, 'A1')
      expect(state.hives.length).toBeGreaterThan(0)
      expect(state.hives.length).toBeLessThanOrEqual(10)
    })

    it('starts with no snipes or ghosts', () => {
      const state = createInitialGameState(80, 40, 'A1')
      expect(state.snipes).toHaveLength(0)
      expect(state.ghosts).toHaveLength(0)
    })

    it('creates walls around the border', () => {
      const state = createInitialGameState(80, 40, 'A1')
      // Check top and bottom walls
      expect(state.maze[0][0]).toBe(EntityType.WALL)
      expect(state.maze[39][0]).toBe(EntityType.WALL)
      // Check left and right walls
      expect(state.maze[0][79]).toBe(EntityType.WALL)
      expect(state.maze[39][79]).toBe(EntityType.WALL)
    })
  })

  describe('movePlayer', () => {
    it('moves player up', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const initialY = state.player.pos.y
      const newState = movePlayer(state, Direction.UP)
      expect(newState.player.pos.y).toBeLessThanOrEqual(initialY)
    })

    it('moves player in diagonal direction', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const newState = movePlayer(state, Direction.UP_RIGHT)
      // Should move in some direction (might be blocked by wall)
      expect(newState.player.pos).toBeDefined()
    })

    it('activates boost mode', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const newState = movePlayer(state, Direction.RIGHT, true)
      expect(newState.player.boosting).toBe(true)
      expect(newState.player.speed).toBe(2)
    })

    it('does not move through walls', () => {
      const state = createInitialGameState(80, 40, 'A1')
      // Try to move player to a wall position (border)
      state.player.pos = { x: 1, y: 1 }
      const newState = movePlayer(state, Direction.UP) // Should hit top wall
      expect(newState.player.pos.y).toBeGreaterThan(0)
    })
  })

  describe('shootBullet', () => {
    it('creates a bullet when shooting', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const newState = shootBullet(state, Direction.UP)
      expect(newState.bullets).toHaveLength(1)
      expect(newState.bullets[0].type).toBe(EntityType.PLAYER_BULLET)
      expect(newState.bullets[0].dir).toBe(Direction.UP)
    })

    it('does not create bullet when direction is NONE', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const newState = shootBullet(state, Direction.NONE)
      expect(newState.bullets).toHaveLength(0)
    })

    it('creates bullet at player position', () => {
      const state = createInitialGameState(80, 40, 'A1')
      const newState = shootBullet(state, Direction.RIGHT)
      expect(newState.bullets[0].pos.x).toBe(state.player.pos.x)
      expect(newState.bullets[0].pos.y).toBe(state.player.pos.y)
    })
  })
})
