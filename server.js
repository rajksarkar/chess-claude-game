const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Store game states (in production, use a proper database)
const games = new Map();

// Serve static files FIRST - works in both local and Vercel
// This must come before other routes to ensure static files are served
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  maxAge: '1d', // Cache static files
  etag: true
}));

// chess.js redirect - keep for backwards compatibility
app.get('/chess.js', (req, res) => {
  res.redirect('/chess-bundle.js');
});

// API routes
// Create a new game
app.post('/api/game/new', (req, res) => {
  const gameId = Date.now().toString();
  games.set(gameId, {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    history: []
  });
  res.json({ gameId, fen: games.get(gameId).fen });
});

// Get AI move from Claude
app.post('/api/game/move', async (req, res) => {
  try {
    const { gameId, move, fen } = req.body;
    
    if (!gameId || !move || !fen) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update game state
    if (games.has(gameId)) {
      const game = games.get(gameId);
      game.fen = fen;
      game.history.push(move);
    } else {
      games.set(gameId, { fen, history: [move] });
    }

    // Get AI move from Claude
    const aiMove = await getAIMove(fen);
    
    res.json({ 
      move: aiMove.move,
      fen: aiMove.fen || fen,
      gameOver: aiMove.gameOver
    });
  } catch (error) {
    console.error('Error getting AI move:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page - must be after API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get AI move using Claude
async function getAIMove(fen) {
  const Chess = require('chess.js');
  const chess = new Chess.Chess(fen);
  
  // Get all legal moves
  const legalMoves = chess.moves({ verbose: true });
  
  if (legalMoves.length === 0) {
    return { move: null, fen: chess.fen(), gameOver: true };
  }

  // Create prompt for Claude
  const prompt = `You are playing chess as Black. The current board position in FEN notation is: ${fen}

Legal moves available: ${legalMoves.map(m => m.san).join(', ')}

Please analyze the position and choose the best move. Respond with ONLY the move in Standard Algebraic Notation (SAN) format, nothing else. For example, if you want to move a pawn from e7 to e6, respond with "e6". If you want to move a knight from g1 to f3, respond with "Nf3".`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929", // Claude 4.5 Sonnet
      max_tokens: 50,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const aiMoveText = message.content[0].text.trim();
    
    // Try to find the move in legal moves
    let move = null;
    for (const legalMove of legalMoves) {
      if (legalMove.san === aiMoveText || legalMove.uci === aiMoveText) {
        move = legalMove;
        break;
      }
    }

    // If exact match not found, try to parse it
    if (!move) {
      try {
        move = chess.move(aiMoveText);
      } catch (e) {
        // If Claude's move is invalid, pick a random legal move
        move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
    }

    chess.move(move);
    
    return {
      move: move.san,
      fen: chess.fen(),
      gameOver: chess.isGameOver()
    };
  } catch (error) {
    console.error('Claude API error:', error);
    // Fallback to random move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    chess.move(randomMove);
    return {
      move: randomMove.san,
      fen: chess.fen(),
      gameOver: chess.isGameOver()
    };
  }
}

// Export for Vercel serverless functions
module.exports = app;

// Only listen if running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Chess game server running on http://localhost:${PORT}`);
    console.log('Make sure to set ANTHROPIC_API_KEY in your .env file');
  });
}
