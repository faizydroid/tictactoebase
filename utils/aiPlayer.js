// AI Player with adjustable difficulty for Tic-Tac-Toe

/**
 * Evaluate the board state
 * @param {Array} board - The game board (0 = empty, 1 = player, 2 = AI)
 * @returns {number} - Score (10 for AI win, -10 for player win, 0 for draw/ongoing)
 */
function evaluateBoard(board) {
  // All possible winning combinations
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      return board[a] === 2 ? 10 : -10; // 2 is AI, 1 is player
    }
  }

  return 0; // No winner yet
}

/**
 * Check if board is full
 */
function isBoardFull(board) {
  return board.every(cell => cell !== 0);
}

/**
 * Minimax algorithm with alpha-beta pruning
 * @param {Array} board - Current board state
 * @param {number} depth - Current depth in game tree
 * @param {boolean} isMaximizing - True if AI's turn, false if player's turn
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @returns {number} - Best score for current position
 */
function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
  const score = evaluateBoard(board);

  // Terminal states
  if (score === 10) return score - depth; // AI wins (prefer faster wins)
  if (score === -10) return score + depth; // Player wins (delay losses)
  if (isBoardFull(board)) return 0; // Draw

  if (isMaximizing) {
    let maxScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === 0) {
        board[i] = 2; // AI move
        const currentScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = 0; // Undo move

        maxScore = Math.max(maxScore, currentScore);
        alpha = Math.max(alpha, currentScore);

        if (beta <= alpha) break; // Beta cutoff
      }
    }

    return maxScore;
  } else {
    let minScore = Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === 0) {
        board[i] = 1; // Player move
        const currentScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = 0; // Undo move

        minScore = Math.min(minScore, currentScore);
        beta = Math.min(beta, currentScore);

        if (beta <= alpha) break; // Alpha cutoff
      }
    }

    return minScore;
  }
}

/**
 * Get a random move from available positions
 */
function getRandomMove(board) {
  const emptyPositions = board
    .map((cell, index) => cell === 0 ? index : null)
    .filter(index => index !== null);
  
  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}

/**
 * Get a defensive move (block player from winning)
 */
function getDefensiveMove(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Check if player is about to win and block them
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    
    // If player has 2 in a row and one empty spot
    if (values.filter(v => v === 1).length === 2 && values.filter(v => v === 0).length === 1) {
      if (board[a] === 0) return a;
      if (board[b] === 0) return b;
      if (board[c] === 0) return c;
    }
  }

  return null;
}

/**
 * Get an offensive move (try to win)
 */
function getOffensiveMove(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Check if AI can win in next move
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    
    // If AI has 2 in a row and one empty spot
    if (values.filter(v => v === 2).length === 2 && values.filter(v => v === 0).length === 1) {
      if (board[a] === 0) return a;
      if (board[b] === 0) return b;
      if (board[c] === 0) return c;
    }
  }

  return null;
}

/**
 * Find the best move for AI using Minimax algorithm
 * @param {Array} board - Current board state (0 = empty, 1 = player, 2 = AI)
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {number} - Best position to play (0-8)
 */
export function getAIMove(board, difficulty = 'medium') {
  const emptyPositions = board
    .map((cell, index) => cell === 0 ? index : null)
    .filter(index => index !== null);

  if (emptyPositions.length === 0) return -1;

  // Easy: 70% random, 30% smart
  if (difficulty === 'easy') {
    if (Math.random() < 0.7) {
      return getRandomMove(board);
    }
    // 30% chance to play defensively
    const defensiveMove = getDefensiveMove(board);
    return defensiveMove !== null ? defensiveMove : getRandomMove(board);
  }

  // Medium: Always block wins, sometimes make optimal moves
  if (difficulty === 'medium') {
    // Always try to win if possible
    const offensiveMove = getOffensiveMove(board);
    if (offensiveMove !== null) return offensiveMove;

    // Always block player from winning
    const defensiveMove = getDefensiveMove(board);
    if (defensiveMove !== null) return defensiveMove;

    // 50% chance to make optimal move, 50% random
    if (Math.random() < 0.5) {
      return getRandomMove(board);
    }

    // Take center if available
    if (board[4] === 0) return 4;

    // Take a corner if available
    const corners = [0, 2, 6, 8].filter(i => board[i] === 0);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return getRandomMove(board);
  }

  // Hard: Perfect play using minimax
  let bestScore = -Infinity;
  let bestMove = emptyPositions[0];

  for (const position of emptyPositions) {
    board[position] = 2; // Try AI move
    const score = minimax([...board], 0, false);
    board[position] = 0; // Undo move

    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return bestMove;
}

/**
 * Check if AI should go first (randomly)
 */
export function shouldAIGoFirst() {
  return Math.random() < 0.5;
}
