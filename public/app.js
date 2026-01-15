// Initialize Chess.js
let chess = null;
let gameId = null;
let playerColor = 'w'; // User plays white
let gameActive = false;
let selectedSquare = null;

// Wait for chess.js to load
function initChess() {
    // chess.js v0.13.4 exposes Chess as a global
    if (typeof Chess !== 'undefined') {
        chess = new Chess();
        console.log('Chess.js loaded successfully');
        initBoard();
        startNewGame();
    } else {
        console.error('Chess.js library not loaded');
        document.getElementById('status').textContent = 'Error: Chess.js library failed to load. Please refresh the page.';
        document.getElementById('status').style.color = 'red';
    }
}

// Initialize the board
function initBoard() {
    if (!chess) return;
    renderBoard();
}

function renderBoard() {
    if (!chess) return;
    
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    // Use CSS Grid for proper 8x8 layout
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 1fr)';
    boardElement.style.gridTemplateRows = 'repeat(8, 1fr)';
    boardElement.style.aspectRatio = '1 / 1';
    boardElement.style.width = '480px';
    boardElement.style.height = '480px';
    
    // Create board squares (from top-left, rank 8 to rank 1)
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.style.backgroundColor = (rank + file) % 2 === 0 ? '#f0d9b5' : '#b58863';
            square.style.position = 'relative';
            square.style.cursor = 'pointer';
            square.style.border = 'none';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.dataset.square = String.fromCharCode(97 + file) + (rank + 1);
            
            // Add piece if exists
            const piece = chess.get(square.dataset.square);
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.classList.add(piece.color === 'w' ? 'piece-white' : 'piece-black');
                pieceElement.textContent = getPieceSymbol(piece);
                pieceElement.style.fontSize = '48px';
                pieceElement.style.width = '100%';
                pieceElement.style.height = '100%';
                pieceElement.style.display = 'flex';
                pieceElement.style.alignItems = 'center';
                pieceElement.style.justifyContent = 'center';
                pieceElement.style.cursor = 'pointer';
                pieceElement.style.userSelect = 'none';
                pieceElement.style.pointerEvents = 'none';
                square.appendChild(pieceElement);
            }
            
            boardElement.appendChild(square);
        }
    }
    
    // Add click handlers
    addClickHandlers();
}

function getPieceSymbol(piece) {
    // chess.js uses lowercase for piece types, color is separate
    const symbols = {
        'p': piece.color === 'w' ? '♙' : '♟',
        'r': piece.color === 'w' ? '♖' : '♜',
        'n': piece.color === 'w' ? '♘' : '♞',
        'b': piece.color === 'w' ? '♗' : '♝',
        'q': piece.color === 'w' ? '♕' : '♛',
        'k': piece.color === 'w' ? '♔' : '♚'
    };
    return symbols[piece.type] || '';
}

function addClickHandlers() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', () => {
            if (!gameActive || chess.turn() !== playerColor) return;
            
            const squareName = square.dataset.square;
            
            if (selectedSquare) {
                // Try to make a move
                const move = chess.move({
                    from: selectedSquare,
                    to: squareName,
                    promotion: 'q'
                });
                
                if (move) {
                    selectedSquare = null;
                    renderBoard();
                    handleMove(move);
                } else {
                    // Invalid move, select new square
                    selectedSquare = squareName;
                    highlightSquare(square);
                }
            } else {
                // Select square
                const piece = chess.get(squareName);
                if (piece && piece.color === playerColor) {
                    selectedSquare = squareName;
                    highlightSquare(square);
                }
            }
        });
    });
}

function highlightSquare(squareElement) {
    // Remove previous highlights
    document.querySelectorAll('.square').forEach(sq => {
        sq.style.boxShadow = '';
    });
    
    if (squareElement) {
        squareElement.style.boxShadow = '0 0 10px 3px rgba(102, 126, 234, 0.8)';
    }
}

async function handleMove(move) {
    updateStatus('Claude is thinking...', 'thinking');
    addMoveToHistory(move);
    
    // Update board
    renderBoard();
    
    // Send move to server and get AI response
    try {
        const response = await fetch('/api/game/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameId,
                move: move.san,
                fen: chess.fen()
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            updateStatus('Error: ' + data.error, '');
            return;
        }
        
        if (data.move) {
            // Make AI move
            chess.load(data.fen);
            addMoveToHistory({ san: data.move, color: 'black' });
            renderBoard();
            
            // Check game status
            if (chess.isCheckmate()) {
                updateStatus('Checkmate! You won!', 'checkmate');
                gameActive = false;
            } else if (chess.isStalemate()) {
                updateStatus('Stalemate! Game is a draw.', 'stalemate');
                gameActive = false;
            } else if (chess.isCheck()) {
                updateStatus('Check! Make your move.', 'check');
            } else {
                updateStatus('Your turn! Make your move.', '');
            }
        } else {
            updateStatus('Game over!', '');
            gameActive = false;
        }
    } catch (error) {
        console.error('Error:', error);
        updateStatus('Error getting AI move. Please try again.', '');
    }
}

function addMoveToHistory(move) {
    const historyDiv = document.getElementById('moveHistory');
    const moveEntry = document.createElement('div');
    moveEntry.className = 'move-entry ' + (move.color || 'white');
    
    if (typeof move === 'object' && move.san) {
        moveEntry.textContent = move.san;
    } else {
        moveEntry.textContent = move;
    }
    
    historyDiv.appendChild(moveEntry);
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function updateStatus(message, className) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + className;
    
    // Update player labels to show whose turn it is
    const topLabel = document.querySelector('.player-label-top');
    const bottomLabel = document.querySelector('.player-label-bottom');
    
    if (chess && gameActive) {
        if (chess.turn() === 'w') {
            // Player's turn (White)
            bottomLabel.style.background = '#4caf50';
            bottomLabel.style.color = 'white';
            bottomLabel.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
            topLabel.style.background = '#333';
            topLabel.style.color = 'white';
            topLabel.style.boxShadow = 'none';
        } else {
            // Claude's turn (Black)
            topLabel.style.background = '#4caf50';
            topLabel.style.color = 'white';
            topLabel.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
            bottomLabel.style.background = '#f5f5f5';
            bottomLabel.style.color = '#333';
            bottomLabel.style.boxShadow = 'none';
        }
    } else {
        // Reset labels
        topLabel.style.background = '#333';
        topLabel.style.color = 'white';
        topLabel.style.boxShadow = 'none';
        bottomLabel.style.background = '#f5f5f5';
        bottomLabel.style.color = '#333';
        bottomLabel.style.boxShadow = 'none';
    }
}

async function startNewGame() {
    if (!chess) {
        updateStatus('Chess engine not initialized. Please refresh.', '');
        return;
    }
    
    try {
        const response = await fetch('/api/game/new', {
            method: 'POST'
        });
        
        const data = await response.json();
        gameId = data.gameId;
        chess.load(data.fen);
        gameActive = true;
        selectedSquare = null;
        
        document.getElementById('moveHistory').innerHTML = '';
        updateStatus('You are White. Make your move!', '');
        renderBoard();
    } catch (error) {
        console.error('Error starting new game:', error);
        updateStatus('Error starting game. Please try again.', '');
    }
}

// Event listeners
document.getElementById('newGameBtn').addEventListener('click', startNewGame);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Wait for chess.js to load from CDN
    const checkChess = () => {
        if (typeof Chess !== 'undefined') {
            initChess();
        } else {
            // Try again after a short delay
            setTimeout(checkChess, 50);
        }
    };
    
    // Start checking immediately
    checkChess();
    
    // Timeout after 3 seconds
    setTimeout(() => {
        if (!chess) {
            document.getElementById('status').textContent = 'Error: Chess.js library failed to load. Please check your internet connection and refresh.';
            document.getElementById('status').style.color = 'red';
        }
    }, 3000);
});
