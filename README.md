# Terminal Velocity - Web Game

A fully playable web version of the Terminal Velocity board game built with React.

## Features

- Hot-seat multiplayer for 4 players
- Complete game mechanics:
  - Buy phase: Purchase upgrades or draw from market
  - Play phase: Play 1-2 cards per turn
  - Discard phase: Optional discard up to 2 cards
  - Draw phase: Automatic draw back to 6 cards
- Visual game board with player tokens
- All 40 basic cards, 31 market cards, 5 upgrades
- Event and Annoyance card systems
- Patience and movement tracking
- Section-based movement restrictions
- Upgrade effects (Expert Traveler, Seasoned Traveler, etc.)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## How to Play

1. Enter player names on the start screen
2. Each turn consists of 4 phases:
   - **Buy Phase**: Optionally purchase an upgrade or draw from market deck (costs patience)
   - **Play Phase**: Play 1-2 cards (2nd card costs 1 patience)
   - **Discard Phase**: Optionally discard up to 2 cards
   - **Draw Phase**: Automatically draw back to 6 cards
3. Race from tile 1 to tile 36
4. Watch your patience - reaching 0 in the Airplane section eliminates you!
5. Must reach tile 25 by round 8 or be eliminated

## Game Sections

- **Drive (Tiles 1-12)**: Use Drive section cards
- **Security (Tiles 13-24)**: Use Security section cards
- **Airplane (Tiles 25-36)**: Use Airplane section cards
- Cards marked "All Sections" can be played anywhere

## Project Structure

```
src/
├── components/        # React components
│   ├── GameBoard/    # Game board display
│   ├── PlayerArea/   # Player hand and stats
│   ├── Card/         # Card component
│   ├── Market/       # Market UI
│   ├── TurnActions/  # Turn phase controls
│   └── GameStatus/   # Round and status display
├── context/          # Game state context
├── data/             # Card definitions
├── reducers/         # State management
└── utils/            # Game logic utilities
```

## Technology Stack

- React 18
- Vite
- CSS Modules
- Context API + useReducer

## Future Enhancements

- [ ] Implement dice rolling for special cards (Reckless Driver, Annoying Traveler)
- [ ] Complete Event/Annoyance card system
- [ ] Add voting system for Coordination Conflict/Conflight
- [ ] Implement cancel card mechanics
- [ ] Add elimination conditions
- [ ] Win/loss screen
- [ ] Animations and sound effects
- [ ] Mobile responsive design
- [ ] Game state persistence

## License

MIT

## Acknowledgments

Built with Claude Code
