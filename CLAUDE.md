# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based chess game where users (playing as White) compete against Claude 4.5 Sonnet AI (playing as Black). The application uses a simple Express backend to interface with the Anthropic API and serves a vanilla JavaScript frontend with chess.js for game logic.

## Development Commands

```bash
# Install dependencies
npm install

# Start the development server (runs on http://localhost:3000)
npm start
# or
npm run dev

# Environment setup
cp .env.example .env
# Then add your ANTHROPIC_API_KEY to .env
```

## Architecture

### Backend (`server.js`)

The Express server handles three main responsibilities:

1. **Static file serving**: Serves the frontend from `public/` directory
2. **Game state management**: Stores active games in an in-memory Map (not persisted)
3. **AI integration**: Communicates with Claude API to generate moves

**Key API endpoints:**
- `POST /api/game/new` - Creates a new game, returns gameId and starting FEN
- `POST /api/game/move` - Receives player move and FEN, returns AI move and updated FEN

**AI move generation** (see `getAIMove()` function in server.js:84-151):
- Creates a chess.js instance from the current FEN position
- Generates list of legal moves for Black
- Prompts Claude with the position and legal moves, requesting move in SAN format
- Uses model: `claude-sonnet-4-5-20250929`
- Fallback: If Claude returns invalid move, picks random legal move
- Returns move in SAN notation, new FEN, and gameOver status

### Frontend (`public/`)

**Files:**
- `index.html` - Main page structure with board container and controls
- `app.js` - Chess game UI logic and API communication
- `style.css` - Visual styling for board and pieces
- `chess-bundle.js` - Bundled chess.js library

**Key frontend concepts:**
- Board is rendered as CSS Grid (8x8 squares) with Unicode chess piece symbols (♔♕♖♗♘♙)
- User plays White (bottom), Claude plays Black (top)
- Square selection flow: Click piece → highlight → click destination → make move
- After player move, frontend sends move to backend and waits for AI response
- Board re-renders after each move with updated FEN from server

**Game state management:**
- `chess` - chess.js instance tracking current position
- `gameId` - Unique identifier from backend for this game session
- `selectedSquare` - Currently selected square for move input
- `gameActive` - Boolean tracking if game is ongoing

### Data Flow

```
User clicks move
  → Frontend validates with chess.js
  → POST to /api/game/move with {gameId, move, fen}
  → Backend updates game state
  → Backend calls getAIMove(fen)
    → Prompts Claude API with position and legal moves
    → Claude returns move in SAN
  → Backend validates AI move with chess.js
  → Returns {move, fen, gameOver} to frontend
  → Frontend updates board and checks for checkmate/stalemate
```

## Deployment

**Vercel configuration** (`vercel.json`):
- Uses `@vercel/node` builder for server.js
- Routes all `/api/*` and other requests through server.js
- Server detects Vercel environment and skips `app.listen()` when `VERCEL=1`

**Environment variables needed in Vercel:**
- `ANTHROPIC_API_KEY` - Required for Claude API calls

## Important Implementation Details

### Chess.js Integration

- Frontend uses global `Chess` object loaded from `chess-bundle.js`
- Backend requires `chess.js` package directly: `require('chess.js')`
- Both use `Chess.Chess()` constructor (note: chess.js v1.0 beta syntax)

### FEN (Forsyth-Edwards Notation)

FEN strings represent the complete board state and are used to synchronize game state between frontend, backend, and Claude. All moves are validated by recreating the chess.js instance from FEN.

### Move Format

- **SAN (Standard Algebraic Notation)**: Human-readable format like "e4", "Nf3", "O-O"
- Claude is prompted to return moves in SAN format
- chess.js handles conversion between SAN and internal representation

### Game State Persistence

Games are stored in memory in the `games` Map with structure:
```javascript
{
  gameId: {
    fen: 'current FEN string',
    history: ['move1', 'move2', ...]
  }
}
```
**Note:** State is lost on server restart. For production, consider database persistence.

### Error Handling

- If Claude API call fails, backend falls back to random legal move
- If Claude returns invalid move, backend attempts to parse it, then falls back to random
- Frontend displays error messages in status area for failed API calls
