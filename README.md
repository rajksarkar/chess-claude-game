# Chess vs Claude 4.5

A web-based chess game where you play against Claude 4.5 Sonnet, powered by Anthropic's reasoning model.

## Features

- 🎮 Interactive chess board with piece movement
- 🤖 AI opponent powered by Claude 4.5 Sonnet
- 📊 Move history tracking
- 🎨 Beautiful, modern UI
- ✅ Game state validation and check/checkmate detection

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Navigate to the project directory:
```bash
cd chess-claude-game
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

5. Start the server:
```bash
npm start
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. You play as **White** (pieces at the bottom)
2. Click on a piece to select it, then click on the destination square to move
3. Claude 4.5 plays as **Black** and will respond after each of your moves
4. The game tracks move history and detects check, checkmate, and stalemate
5. Click "New Game" to start over

## Project Structure

```
chess-claude-game/
├── server.js          # Express server with Claude API integration
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create this)
├── .env.example      # Example environment file
├── README.md         # This file
└── public/
    ├── index.html    # Main HTML page
    ├── style.css     # Styling
    └── app.js        # Frontend chess game logic
```

## How It Works

1. **Frontend**: The chess board is rendered using HTML/CSS/JavaScript with chess.js handling game logic
2. **Backend**: Node.js/Express server receives moves and sends the current board position to Claude
3. **AI**: Claude 4.5 analyzes the position and returns the best move in Standard Algebraic Notation (SAN)
4. **Game Flow**: User makes a move → Server validates → Claude responds → Board updates

## API Endpoints

- `POST /api/game/new` - Creates a new game
- `POST /api/game/move` - Sends user move and receives AI move

## Notes

- The AI uses Claude 3.5 Sonnet model for reasoning
- If Claude returns an invalid move, the system falls back to a random legal move
- Game state is stored in memory (for production, use a database)

## Troubleshooting

- **"ANTHROPIC_API_KEY is not set"**: Make sure you've created a `.env` file with your API key
- **AI moves not working**: Check your API key is valid and you have API credits
- **Board not displaying**: Make sure all files in the `public` folder are present

## License

MIT
