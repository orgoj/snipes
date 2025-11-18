# 🎮 SNIPES - Retro ASCII Terminal Game

A modern browser-based clone of the classic 1982 text-mode game **Snipes** for Novell NetWare, recreated with React, TypeScript, and authentic CRT terminal aesthetics.

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          S N I P E S                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

  ████████████████████████████████████████████████████████████████████████
  █                                                                      █
  █    @     S           █████                                          █
  █                                         H                            █
  █         •                                                            █
  █              █████          S                                        █
  █                                                                      █
  █                         G                                            █
  █  █████                              █████                            █
  █                                                                      █
  █         S                                      H                     █
  █                                                                      █
  ████████████████████████████████████████████████████████████████████████

  SCORE: 600  LIVES: ♥♥♥  LEVEL: A1  HIVES: 2  SNIPES: 3  GHOSTS: 1

  @ = You    S = Snipe    G = Ghost    H = Hive    • = Bullet    █ = Wall
```

## 🎯 About

Snipes is a maze-based top-down shooter where you navigate procedurally-generated labyrinths, eliminating enemy generators (Hives) and their spawned units (Snipes). Features authentic retro terminal aesthetics with CRT scanlines, phosphor glow, and classic ASCII graphics.

**Original game:** Created in 1982 by SuperSet Software for Novell NetWare
**This clone:** Modern React implementation with TypeScript and browser-only gameplay

## ✨ Features

- 🖥️ **Authentic CRT Terminal Effects** - Scanlines, phosphor glow, screen flicker
- 🎨 **3 Color Schemes** - Classic green, amber, and white phosphor displays
- 🎲 **Procedural Maze Generation** - Every game is unique
- 🎮 **Twin-stick Controls** - Move and shoot in different directions simultaneously
- 🚀 **Speed Boost Mechanic** - Temporary speed increase to escape danger
- 📊 **234 Difficulty Levels** - From A1 (easiest) to Z9 (hardest)
- 💾 **LocalStorage** - Saves settings and high scores
- 🧪 **Comprehensive Testing** - 24 unit tests with Vitest
- 🔧 **Session-Start Hook** - Auto-setup for Claude Code on the web

## 🕹️ Controls

| Action | Keys |
|--------|------|
| **Movement** | Arrow Keys (8-directional) |
| **Shoot** | W, A, S, D (up, left, down, right) |
| **Speed Boost** | Spacebar |
| **Pause** | ESC |

**Pro Tip:** You can move and shoot in different directions at the same time!

## 🎯 Objective

1. **Destroy all Hives** (H) - Enemy generators that spawn Snipes
2. **Eliminate all Snipes** (S) - Armed enemies that shoot back
3. **Avoid Ghosts** (G) - Harmless but blocking entities that fade after 10 seconds
4. **Survive** - Don't run out of lives!

### Enemy Types

- **Snipe (S)** - Armed enemies that track and shoot at you. Killed snipes turn into Ghosts.
- **Ghost (G)** - Spawned from dead Snipes. Can't attack but block movement. Fade away after 10 seconds.
- **Hive (H)** - Stationary generators that spawn Snipes. Must be destroyed to win. Take 3 hits.

### Scoring

- **+100 points** - Kill a Snipe
- **+500 points** - Destroy a Hive

## 🚀 Quick Start

### Play Online

Visit: `https://[username].github.io/snipes/`

### Run Locally

```bash
# Clone the repository
git clone https://github.com/[username]/snipes.git
cd snipes

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript 5.9
- **Build Tool:** Vite 7
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint 9 + Prettier 3
- **Styling:** CSS3 with CRT effects
- **State Management:** React hooks + immutable updates
- **Deployment:** GitHub Pages + GitHub Actions

## 📁 Project Structure

```
snipes/
├── src/
│   ├── components/      # React UI components
│   │   ├── Game.tsx     # Main game orchestrator
│   │   ├── Terminal.tsx # ASCII renderer with CRT effects
│   │   ├── Menu.tsx     # Menu system
│   │   └── Terminal.css # Retro terminal styling
│   ├── game/            # Pure game logic
│   │   ├── types.ts     # TypeScript interfaces
│   │   ├── gameEngine.ts # Core game mechanics
│   │   ├── difficulty.ts # A1-Z9 difficulty system
│   │   └── mazeGenerator.ts # Procedural maze generation
│   ├── utils/           # Utilities
│   │   └── storage.ts   # LocalStorage wrapper
│   └── test/            # Test configuration
├── .claude/             # Claude Code configuration
│   ├── hooks/
│   │   └── session-start.sh # Auto-install dependencies
│   └── settings.json
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Pages CI/CD
└── package.json
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

**Current Coverage:** 24 tests passing
**Test Files:** gameEngine.test.ts, difficulty.test.ts, App.test.tsx

## 🎨 Difficulty Levels (A1-Z9)

The game features 234 difficulty levels in a grid format:

| Level | Hives | Max Snipes | Lives | Speed Multiplier |
|-------|-------|------------|-------|------------------|
| **A1** (Easiest) | 3 | 10 | 5 ♥ | 1.0x |
| **M5** (Medium) | 6 | 80 | 3 ♥ | 2.0x |
| **Z9** (Hardest) | 10 | 150 | 2 ♥ | 3.0x |

**Progression:**
- More hives to destroy
- More simultaneous enemies
- Faster enemy movement
- Faster enemy shooting
- Fewer lives

## 🔧 Development

### Session-Start Hook

For Claude Code on the web, the `.claude/hooks/session-start.sh` automatically installs dependencies when starting a new session.

```bash
# Manually run the hook
CLAUDE_CODE_REMOTE=true ./.claude/hooks/session-start.sh
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks

The project uses Husky and lint-staged to ensure code quality:
- Automatically formats code on commit
- Runs ESLint on staged files
- Prevents commits with errors

## 🚢 Deployment

The project automatically deploys to GitHub Pages when pushing to `main` or `master` branch.

**GitHub Actions workflow:**
1. Install dependencies
2. Run tests (`npm run test:run`)
3. Run linter (`npm run lint`)
4. Build production bundle (`npm run build`)
5. Deploy to GitHub Pages

**Manual deployment:**
```bash
npm run build
# Upload contents of `dist/` folder to your web server
```

## 🎯 Known Issues & Future Improvements

### Implemented ✅
- [x] Ghost win condition (ghosts no longer prevent winning)
- [x] Ghost fade-away system (10 seconds)
- [x] Score system (100 per snipe, 500 per hive)
- [x] Player speed boost working correctly
- [x] React purity compliance
- [x] Removed unimplemented difficulty features

### Roadmap 🚧
- [ ] Visual feedback (explosions, muzzle flash, hit effects)
- [ ] Sound effects (retro beeps and boops)
- [ ] Maze connectivity validation
- [ ] Better AI pathfinding (A* algorithm)
- [ ] Keyboard menu navigation
- [ ] Higher test coverage (target: 80%)
- [ ] Accessibility improvements (colorblind mode, screen reader)
- [ ] 2-player co-op mode (WebRTC peer-to-peer)

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version

## 📜 License

This is a fan remake of the classic Snipes game. Original game created by SuperSet Software (1982).

This implementation: MIT License

## 🙏 Credits

- **Original Game:** SuperSet Software (1982) for Novell NetWare
- **Implementation:** Claude + React + TypeScript
- **Inspiration:** Classic DOS-era terminal games

## 🔗 Links

- [Original Snipes on Wikipedia](https://en.wikipedia.org/wiki/Snipes_(video_game))
- [Play Online](#) (Replace with your GitHub Pages URL)
- [Report Issues](#) (Replace with your GitHub Issues URL)

---

**Made with ❤️ and retro nostalgia**

Enjoy the game! Press `START GAME` and destroy those hives! 🎮
