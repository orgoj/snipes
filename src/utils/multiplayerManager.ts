import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'
import type { GameState, Direction } from '../game/types'

export interface PlayerInput {
  type: 'input'
  moveDirection: Direction
  shootDirection: Direction
  boosting: boolean
  timestamp: number
}

export interface GameStateSync {
  type: 'state'
  gameState: GameState
  timestamp: number
}

export type MultiplayerMessage = PlayerInput | GameStateSync

export class MultiplayerManager {
  private peer: Peer | null = null
  private connection: DataConnection | null = null
  private onStateUpdate: ((state: GameState) => void) | null = null
  private onPlayerInput: ((input: PlayerInput) => void) | null = null
  private onConnected: (() => void) | null = null
  private onDisconnected: (() => void) | null = null
  private isHost: boolean = false

  constructor() {
    // Initialize with random ID for PeerJS
    this.peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    })

    // Add error handler for peer initialization
    this.peer.on('error', (error) => {
      console.error('PeerJS error:', error)
      if (this.onDisconnected) {
        this.onDisconnected()
      }
    })
  }

  // Host creates a room and waits for guest
  async hostGame(onConnected: () => void): Promise<string> {
    this.isHost = true
    this.onConnected = onConnected

    return new Promise((resolve) => {
      this.peer!.on('open', (id) => {
        const roomCode = this.generateRoomCode(id)
        resolve(roomCode)

        this.peer!.on('connection', (conn) => {
          this.connection = conn
          this.setupConnection()
        })
      })
    })
  }

  // Guest joins existing room
  async joinGame(roomCode: string, onConnected: () => void): Promise<void> {
    this.isHost = false
    this.onConnected = onConnected

    return new Promise((resolve, reject) => {
      this.peer!.on('open', () => {
        const peerId = this.decodeRoomCode(roomCode)
        this.connection = this.peer!.connect(peerId)
        this.setupConnection()
        resolve()
      })

      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    })
  }

  private setupConnection() {
    if (!this.connection) return

    this.connection.on('open', () => {
      console.log('WebRTC connection established')
      if (this.onConnected) this.onConnected()
    })

    this.connection.on('data', (data) => {
      const message = data as MultiplayerMessage

      if (message.type === 'state' && !this.isHost) {
        // Guest receives game state from host
        if (this.onStateUpdate) {
          this.onStateUpdate(message.gameState)
        }
      } else if (message.type === 'input' && this.isHost) {
        // Host receives player 2 input
        if (this.onPlayerInput) {
          this.onPlayerInput(message)
        }
      }
    })

    this.connection.on('close', () => {
      console.log('Connection closed')
      if (this.onDisconnected) this.onDisconnected()
    })

    this.connection.on('error', (err) => {
      console.error('Connection error:', err)
      if (this.onDisconnected) this.onDisconnected()
    })
  }

  // Send game state (host → guest)
  sendGameState(state: GameState) {
    if (!this.connection || !this.isHost) return

    const message: GameStateSync = {
      type: 'state',
      gameState: state,
      timestamp: Date.now(),
    }

    this.connection.send(message)
  }

  // Send player input (guest → host)
  sendPlayerInput(moveDirection: Direction, shootDirection: Direction, boosting: boolean) {
    if (!this.connection || this.isHost) return

    const message: PlayerInput = {
      type: 'input',
      moveDirection,
      shootDirection,
      boosting,
      timestamp: Date.now(),
    }

    this.connection.send(message)
  }

  // Register callbacks
  onGameStateUpdate(callback: (state: GameState) => void) {
    this.onStateUpdate = callback
  }

  onPlayer2Input(callback: (input: PlayerInput) => void) {
    this.onPlayerInput = callback
  }

  onConnectionClosed(callback: () => void) {
    this.onDisconnected = callback
  }

  // Use peer ID directly as room code (no hashing needed)
  private generateRoomCode(peerId: string): string {
    // Return peer ID directly - PeerJS IDs are short enough to share
    return peerId.toUpperCase()
  }

  private decodeRoomCode(roomCode: string): string {
    // Room code IS the peer ID (just uppercased by UI)
    return roomCode.toLowerCase()
  }

  disconnect() {
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.connection.open
  }
}
