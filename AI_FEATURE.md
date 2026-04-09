# 🤖 AI Player Feature

## Overview

Your tic-tac-toe game now includes a challenging AI opponent that plays perfectly using the Minimax algorithm!

## Features

### 🔴 Perfect AI Opponent

- AI uses Minimax algorithm with alpha-beta pruning
- Plays optimally every time
- Nearly impossible to beat
- Best outcome is usually a draw

### 📊 Local Statistics

- Tracks your wins, losses, and draws vs AI
- Stored in browser localStorage
- Persists across sessions
- Separate from on-chain stats

### ⚡ Instant Gameplay

- No blockchain transactions needed
- No gas fees
- Instant moves
- Practice before playing on-chain

## How to Play

### 1. Access AI Mode

From the homepage:
1. Click "Play Game" tab
2. Click "🤖 Play vs AI" button

### 2. Play the Game

- Game starts automatically
- You play as X
- AI plays as O
- Who goes first is random
- Click any empty cell to make your move
- AI responds automatically after 0.5 seconds

### 3. View Results

After each game:
- See if you won, lost, or drew
- View updated statistics
- Play again or quit

## Technical Details

### AI Algorithm

The AI uses the **Minimax algorithm** with:
- Alpha-beta pruning for optimization
- Depth-based scoring (prefers faster wins)
- Perfect play guaranteed

### Implementation

**Files:**
- `utils/aiPlayer.js` - AI logic and minimax algorithm
- `pages/ai-game.js` - AI game page component
- `components/GameLobby.js` - Updated with AI option

**Key Functions:**
- `getAIMove(board)` - Returns best move for AI
- `minimax(board, depth, isMaximizing)` - Minimax algorithm
- `evaluateBoard(board)` - Evaluates board state

### Performance

- Instant move calculation (< 10ms)
- No server calls needed
- Runs entirely in browser
- No blockchain transactions

## Strategy Tips

### Against Perfect AI

- Force a draw is the best realistic outcome
- AI never makes mistakes
- Perfect opening is crucial
- Center or corner first move recommended
- Block AI's winning moves immediately
- Create double-threat situations when possible

## Differences from On-Chain Mode

| Feature | AI Mode | On-Chain Mode |
|---------|---------|---------------|
| Cost | Free | ~$0.25-$0.50 per move |
| Speed | Instant | 2-5 seconds per move |
| Stats | Local only | Blockchain permanent |
| Opponent | AI | Real players |
| Practice | ✅ Yes | ❌ No |

## Benefits

### For New Players
- Learn the game without spending gas
- Practice strategies against perfect opponent
- Build confidence

### For All Players
- Quick games anytime
- No need to find opponents
- Test strategies against optimal play
- Improve skills

## Future Enhancements

Potential additions:
- Move hints and suggestions
- Game replay and analysis
- Tournament mode vs AI
- Opening book strategies

## FAQ

**Q: Does AI mode cost gas?**
A: No! AI mode is completely free and runs in your browser.

**Q: Are AI stats stored on-chain?**
A: No, AI stats are stored locally in your browser.

**Q: Can I beat the AI?**
A: It's very difficult! The AI plays perfectly using minimax. Best outcome is usually a draw.

**Q: Why is there a delay after AI moves?**
A: The 0.5 second delay makes the game feel more natural and gives you time to see the AI's move.

**Q: Can I play AI mode offline?**
A: Yes! Once the page loads, AI mode works offline.

**Q: How does the AI always play perfectly?**
A: The AI uses the minimax algorithm which evaluates all possible game outcomes to choose the optimal move.

---

**Challenge yourself against the perfect AI! 🤖🎮**