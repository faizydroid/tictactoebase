import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useWeb3 } from '../context/Web3Context'
import GameBoard from '../components/GameBoard'
import AnimatedBackground from '../components/AnimatedBackground'
import { getAIMove, shouldAIGoFirst } from '../utils/aiPlayer'

export default function AIGamePage() {
  const router = useRouter()
  const { account, contract, recordAIGameResult, playerData } = useWeb3()
  const [board, setBoard] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameResult, setGameResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [draws, setDraws] = useState(0)
  const [difficulty, setDifficulty] = useState('medium')
  const [winningLine, setWinningLine] = useState(null)
  const [showResultScreen, setShowResultScreen] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState(null) // 'pending', 'confirmed', null
  const [gameKey, setGameKey] = useState(0) // Force re-render of GameBoard
  const initialized = useRef(false)

  useEffect(() => {
    if (playerData) {
      setPlayerWins(playerData.wins)
      setAiWins(playerData.losses)
      const totalDraws = playerData.gamesPlayed - playerData.wins - playerData.losses
      setDraws(totalDraws >= 0 ? totalDraws : 0)
    }
  }, [playerData])

  useEffect(() => {
    if (account && !initialized.current) {
      initialized.current = true
      startGame()
    }
  }, [account])

  const startGame = () => {
    const newBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    setBoard(newBoard)
    setGameResult(null)
    setWinningLine(null)
    setShowResultScreen(false)
    setTransactionStatus(null)
    setGameKey(prev => prev + 1) // Force GameBoard re-render
    
    const aiFirst = shouldAIGoFirst()
    setIsPlayerTurn(!aiFirst)
    
    if (aiFirst) {
      setTimeout(() => makeAIMove(newBoard), 500)
    }
  }

  const checkWinner = (currentBoard) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (currentBoard[a] !== 0 && 
          currentBoard[a] === currentBoard[b] && 
          currentBoard[b] === currentBoard[c]) {
        return { winner: currentBoard[a], line: pattern }
      }
    }

    if (currentBoard.every(cell => cell !== 0)) {
      return { winner: 'draw', line: null }
    }

    return null
  }

  const makeAIMove = (currentBoard) => {
    const aiPosition = getAIMove([...currentBoard], difficulty)
    
    if (aiPosition === -1) return

    const newBoard = [...currentBoard]
    newBoard[aiPosition] = 2

    setBoard(newBoard)
    setIsPlayerTurn(true)

    const result = checkWinner(newBoard)
    if (result) {
      handleGameEnd(result.winner, result.line)
    }
  }

  const handlePlayerMove = (position) => {
    if (!isPlayerTurn || board[position] !== 0 || gameResult) return

    const newBoard = [...board]
    newBoard[position] = 1

    setBoard(newBoard)
    setIsPlayerTurn(false)

    const result = checkWinner(newBoard)
    if (result) {
      handleGameEnd(result.winner, result.line)
    } else {
      setTimeout(() => makeAIMove(newBoard), 500)
    }
  }

  const handleGameEnd = async (winner, line) => {
    let resultType = 'draw'
    let won = false
    
    if (winner === 1) {
      resultType = 'win'
      won = true
    } else if (winner === 2) {
      resultType = 'lose'
      won = false
    }
    
    setGameResult({ type: resultType })
    setWinningLine(line)
    
    // Show result screen after animations complete
    setTimeout(() => {
      setShowResultScreen(true)
      
      // Start transaction if not a draw
      if (contract && resultType !== 'draw') {
        recordTransaction(won)
      }
    }, 1200) // Wait for line + collapse animations
  }

  const recordTransaction = async (won) => {
    setTransactionStatus('pending')
    try {
      const success = await recordAIGameResult(won)
      if (success) {
        setTransactionStatus('confirmed')
      } else {
        setTransactionStatus(null)
      }
    } catch (error) {
      console.error('Error recording game result:', error)
      setTransactionStatus(null)
    }
  }

  const handlePlayAgain = () => {
    const newBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    setBoard(newBoard)
    setGameResult(null)
    setWinningLine(null)
    setShowResultScreen(false)
    setTransactionStatus(null)
    setGameKey(prev => prev + 1) // Force GameBoard re-render
    
    const aiFirst = shouldAIGoFirst()
    setIsPlayerTurn(!aiFirst)
    
    if (aiFirst) {
      setTimeout(() => makeAIMove(newBoard), 500)
    }
  }

  const handleQuit = () => {
    router.push('/')
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="compact-card text-center max-w-sm">
          <h2 className="text-xl font-black mb-2">Connect Wallet</h2>
          <p className="text-gray-600 text-sm mb-4">Please connect your wallet to play</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full">
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="compact-card text-center p-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-purple-500 mb-3"></div>
          <div className="text-lg font-black">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      {/* Animated Background with X and O */}
      <AnimatedBackground />
      
      {/* Compact Header */}
      <div className="header-compact flex items-center justify-between relative z-10">
        <button onClick={handleQuit} className="text-gray-600 hover:text-black text-sm font-bold">
          ← Back
        </button>
        <div className="text-xs font-bold text-gray-600">vs AI</div>
      </div>

      {/* Main Content - No Scroll */}
      <div className="px-4 py-3 max-w-md mx-auto relative z-10">
        {/* Status + Stats Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Turn Indicator */}
          <div className="text-xs font-bold">
            {gameResult ? (
              <span className="text-gray-600">Game Over</span>
            ) : isPlayerTurn ? (
              <span className="text-blue-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Your Turn
              </span>
            ) : (
              <span className="text-pink-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-pink-600 rounded-full animate-pulse"></span>
                AI Turn
              </span>
            )}
          </div>

          {/* Compact Stats Pills */}
          <div className="flex gap-1.5">
            <div className="stat-pill bg-green-100 text-green-700">
              <span className="text-xs">✓</span>
              <span>{playerWins}</span>
            </div>
            <div className="stat-pill bg-yellow-100 text-yellow-700">
              <span className="text-xs">=</span>
              <span>{draws}</span>
            </div>
            <div className="stat-pill bg-red-100 text-red-700">
              <span className="text-xs">✗</span>
              <span>{aiWins}</span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-3">
          <GameBoard 
            key={gameKey}
            board={board}
            onMove={handlePlayerMove}
            disabled={!isPlayerTurn || gameResult !== null}
            playerNumber={1}
            gameResult={gameResult}
            winningLine={winningLine}
          />
        </div>

        {/* Action Buttons - Always Visible */}
        {!gameResult && (
          <div className="flex gap-2">
            <button onClick={handlePlayAgain} className="flex-1 btn-secondary text-xs">
              Restart
            </button>
            <button onClick={handleQuit} className="flex-1 btn-secondary text-xs">
              Quit
            </button>
          </div>
        )}
      </div>

      {/* Result Screen Overlay */}
      {showResultScreen && (
        <>
          <div className="game-overlay"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="result-screen compact-card max-w-sm w-full p-8 text-center bg-white">
              {/* Result Title */}
              <div className="result-title mb-4">
                {gameResult.type === 'win' && (
                  <div>
                    <div className="text-4xl font-black gradient-text mb-2">YOU WIN!</div>
                    <div className="text-2xl mb-2">🎉</div>
                  </div>
                )}
                {gameResult.type === 'lose' && (
                  <div>
                    <div className="text-4xl font-black text-purple-700 mb-2">YOU LOSE</div>
                    <div className="text-2xl mb-2">😔</div>
                  </div>
                )}
                {gameResult.type === 'draw' && (
                  <div>
                    <div className="text-4xl font-black text-yellow-700 mb-2">IT'S A DRAW!</div>
                    <div className="text-2xl mb-2">🤝</div>
                  </div>
                )}
              </div>

              {/* Transaction Status */}
              {gameResult.type !== 'draw' && (
                <div className="result-subtitle mb-6">
                  {transactionStatus === 'pending' && (
                    <div className="transaction-pending text-sm text-gray-600 font-bold">
                      Recording transaction
                      <span className="loading-dots ml-1">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  )}
                  {transactionStatus === 'confirmed' && (
                    <div className="transaction-confirmed text-sm text-green-600 font-bold flex items-center justify-center gap-2">
                      <span>Transaction Confirmed</span>
                      <span className="text-lg">✅</span>
                    </div>
                  )}
                  {transactionStatus === null && (
                    <div className="text-sm text-gray-500 font-medium">
                      No transaction recorded
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="result-buttons flex gap-3">
                <button onClick={handlePlayAgain} className="flex-1 btn-success">
                   Restart
                </button>
                <button onClick={handleQuit} className="flex-1 btn-secondary">
                   Quit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
