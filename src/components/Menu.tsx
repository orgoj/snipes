import { useState } from 'react'
import { getAllDifficultyLevels } from '../game/difficulty'
import './Terminal.css'

interface MenuProps {
  onStartGame: (difficulty: string) => void
  onHostGame?: (difficulty: string) => void
  onJoinGame?: (roomCode: string) => void
  onCancelWait?: () => void
  roomCode?: string | null
  isWaitingForPlayer?: boolean
  colorScheme?: 'green' | 'amber' | 'white' | 'vga'
  onColorSchemeChange?: (scheme: 'green' | 'amber' | 'white' | 'vga') => void
}

export default function Menu({
  onStartGame,
  onHostGame,
  onJoinGame,
  onCancelWait,
  roomCode,
  isWaitingForPlayer = false,
  colorScheme = 'green',
  onColorSchemeChange
}: MenuProps) {
  const [showMultiplayer, setShowMultiplayer] = useState(false)
  const [showJoinInput, setShowJoinInput] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('A1')
  const [joinRoomCode, setJoinRoomCode] = useState('')

  const difficulties = getAllDifficultyLevels()

  const handleStart = () => {
    onStartGame(selectedDifficulty)
  }

  const handleHostGame = () => {
    if (onHostGame) {
      onHostGame(selectedDifficulty)
    }
  }

  const handleJoinGame = () => {
    if (onJoinGame && joinRoomCode) {
      onJoinGame(joinRoomCode)
    }
  }

  // If waiting for player, show room code
  if (isWaitingForPlayer && roomCode) {
    return (
      <div className="menu">
        <h1>
          ╔═══════════════════════════╗
          <br />
          ║ &nbsp; &nbsp; S N I P E S &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;║
          <br />
          ╚═══════════════════════════╝
        </h1>
        <h2 style={{ textAlign: 'center', marginTop: '20px' }}>WAITING FOR PLAYER...</h2>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>Room Code:</p>
          <p style={{ fontSize: '32px', letterSpacing: '0.2em', color: '#00ff00' }}>{roomCode}</p>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Share this code with your friend!
          </p>
        </div>
        <div className="menu-options">
          <button className="menu-button" onClick={onCancelWait}>
            CANCEL
          </button>
        </div>
      </div>
    )
  }

  // If joining with room code input
  if (showJoinInput) {
    return (
      <div className="menu">
        <h1>
          ╔═══════════════════════════╗
          <br />
          ║ &nbsp; &nbsp; S N I P E S &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;║
          <br />
          ╚═══════════════════════════╝
        </h1>
        <h2 style={{ textAlign: 'center', marginTop: '20px' }}>JOIN CO-OP GAME</h2>
        <div style={{ margin: '20px 0' }}>
          <p style={{ textAlign: 'center', marginBottom: '10px' }}>Enter Room Code:</p>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="ABCD12"
            maxLength={6}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '24px',
              textAlign: 'center',
              background: '#000',
              border: '2px solid #00ff00',
              color: '#00ff00',
              fontFamily: 'Courier New, monospace',
              letterSpacing: '0.3em',
            }}
          />
        </div>
        <div className="menu-options">
          <button className="menu-button" onClick={handleJoinGame} disabled={!joinRoomCode}>
            CONNECT
          </button>
          <button className="menu-button" onClick={() => { setShowJoinInput(false); setShowMultiplayer(false); }}>
            BACK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="menu">
      <h1>
        ╔═══════════════════════════╗
        <br />
        ║ &nbsp; &nbsp; S N I P E S &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;║
        <br />
        ╚═══════════════════════════╝
      </h1>

      {!showMultiplayer && !showSettings ? (
        <div className="menu-options">
          <button className="menu-button" onClick={handleStart}>
            START SOLO GAME
          </button>
          <button className="menu-button" onClick={() => setShowMultiplayer(true)}>
            CO-OP MODE
          </button>
          <button className="menu-button" onClick={() => setShowSettings(true)}>
            SETTINGS
          </button>
        </div>
      ) : showSettings ? (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>SETTINGS</h2>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px' }}>DIFFICULTY</h3>
            <p style={{ textAlign: 'center', fontSize: '12px', marginBottom: '10px' }}>
              Current: {selectedDifficulty}
            </p>
            <div className="difficulty-selector">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  className={`difficulty-button ${selectedDifficulty === diff ? 'selected' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px' }}>DISPLAY MODE</h3>
            <div className="menu-options">
              <button
                className={`menu-button ${colorScheme === 'vga' ? 'selected' : ''}`}
                onClick={() => onColorSchemeChange?.('vga')}
                style={colorScheme === 'vga' ? { background: '#00ff00', color: '#000' } : {}}
              >
                VGA (Classic Snipes)
              </button>
              <button
                className={`menu-button ${colorScheme === 'green' ? 'selected' : ''}`}
                onClick={() => onColorSchemeChange?.('green')}
                style={colorScheme === 'green' ? { background: '#00ff00', color: '#000' } : {}}
              >
                Green Phosphor
              </button>
              <button
                className={`menu-button ${colorScheme === 'amber' ? 'selected' : ''}`}
                onClick={() => onColorSchemeChange?.('amber')}
                style={colorScheme === 'amber' ? { background: '#00ff00', color: '#000' } : {}}
              >
                Amber Monitor
              </button>
              <button
                className={`menu-button ${colorScheme === 'white' ? 'selected' : ''}`}
                onClick={() => onColorSchemeChange?.('white')}
                style={colorScheme === 'white' ? { background: '#00ff00', color: '#000' } : {}}
              >
                White Terminal
              </button>
            </div>
          </div>

          <div className="menu-options">
            <button className="menu-button" onClick={() => setShowSettings(false)}>
              BACK
            </button>
          </div>
        </div>
      ) : showMultiplayer ? (
        <div className="menu-options">
          <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>CO-OP MODE</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', marginBottom: '15px', opacity: 0.8 }}>
            2 players, shared goal, destroy all hives!
          </p>
          <button className="menu-button" onClick={handleHostGame}>
            HOST GAME
          </button>
          <button className="menu-button" onClick={() => setShowJoinInput(true)}>
            JOIN GAME
          </button>
          <button className="menu-button" onClick={() => setShowMultiplayer(false)}>
            BACK
          </button>
        </div>
      ) : null}

      <div className="controls-help">
        <p>
          <strong>CONTROLS:</strong>
        </p>
        <p>Player 1: Arrow Keys (move) + WASD (shoot)</p>
        {showMultiplayer && <p>Player 2: IJKL (move) + TFGH (shoot)</p>}
        <p>SPACE - Speed Boost</p>
        <p>ESC - Menu</p>
        <p></p>
        <p>
          <strong>OBJECTIVE:</strong>
        </p>
        <p>Destroy all HIVES (H) and eliminate all SNIPES (S)</p>
        <p>Avoid GHOSTS (G) - they fade after 10s!</p>
      </div>
    </div>
  )
}
