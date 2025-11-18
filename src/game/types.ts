export interface Position {
  x: number
  y: number
}

export interface Entity {
  id: string
  pos: Position
  type: EntityType
}

// Using const object instead of enum for erasableSyntaxOnly compatibility
export const EntityType = {
  EMPTY: ' ',
  WALL: '█',
  PLAYER: '@',
  PLAYER2: '#',
  SNIPE: 'S',
  GHOST: 'G',
  HIVE: 'H',
  BULLET: '•',
  PLAYER_BULLET: '*',
} as const

export type EntityType = (typeof EntityType)[keyof typeof EntityType]

export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP_LEFT: 'UP_LEFT',
  UP_RIGHT: 'UP_RIGHT',
  DOWN_LEFT: 'DOWN_LEFT',
  DOWN_RIGHT: 'DOWN_RIGHT',
  NONE: 'NONE',
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]

export interface Player extends Entity {
  type: typeof EntityType.PLAYER | typeof EntityType.PLAYER2
  lives: number
  speed: number
  boosting: boolean
}

export interface Snipe extends Entity {
  type: typeof EntityType.SNIPE
  moveTimer: number
  shootTimer: number
}

export interface Ghost extends Entity {
  type: typeof EntityType.GHOST
  moveTimer: number
  fadeTimer: number // Ghosts fade away after 10 seconds
}

export interface Hive extends Entity {
  type: typeof EntityType.HIVE
  spawnTimer: number
  health: number
}

export interface Bullet extends Entity {
  type: typeof EntityType.BULLET | typeof EntityType.PLAYER_BULLET
  dir: Direction
  speed: number
  fromPlayer: boolean
}

export interface DifficultyConfig {
  level: string // e.g., 'A1', 'B5', 'Z9'
  hives: number // 3-10
  maxSnipes: number // 10-150
  lives: number // 2-5
  snipeSpeed: number
  snipeShootRate: number
  hiveSpawnRate: number
}

export const GameMode = {
  SOLO: 'SOLO',
  COOP_HOST: 'COOP_HOST',
  COOP_GUEST: 'COOP_GUEST',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

export interface GameState {
  player: Player
  player2: Player | null // For multiplayer mode
  snipes: Snipe[]
  ghosts: Ghost[]
  hives: Hive[]
  bullets: Bullet[]
  maze: EntityType[][]
  width: number
  height: number
  difficulty: DifficultyConfig
  score: number
  gameOver: boolean
  won: boolean
  enemyCount: number
  gameMode: GameMode
}
