import { useState } from 'react'
import { getAllDifficultyLevels } from '../game/difficulty'
import './Terminal.css'

interface MenuProps {
  onStartGame: (difficulty: string) => void
}

export default function Menu({ onStartGame }: MenuProps) {
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('A1')

  const difficulties = getAllDifficultyLevels()

  const handleStart = () => {
    onStartGame(selectedDifficulty)
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

      {!showDifficulty ? (
        <div className="menu-options">
          <button className="menu-button" onClick={handleStart}>
            START GAME
          </button>
          <button className="menu-button" onClick={() => setShowDifficulty(true)}>
            SELECT DIFFICULTY
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>SELECT DIFFICULTY (A1-Z9)</h2>
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
          <div className="menu-options">
            <button className="menu-button" onClick={handleStart}>
              START
            </button>
            <button className="menu-button" onClick={() => setShowDifficulty(false)}>
              BACK
            </button>
          </div>
        </div>
      )}

      <div className="controls-help">
        <p>
          <strong>CONTROLS:</strong>
        </p>
        <p>ARROW KEYS - Move</p>
        <p>W/A/S/D - Shoot (Up/Left/Down/Right)</p>
        <p>SPACE - Speed Boost</p>
        <p>ESC - Menu</p>
        <p></p>
        <p>
          <strong>OBJECTIVE:</strong>
        </p>
        <p>Destroy all HIVES (H) and eliminate all SNIPES (S)</p>
        <p>Avoid GHOSTS (G) - they chase you!</p>
      </div>
    </div>
  )
}
